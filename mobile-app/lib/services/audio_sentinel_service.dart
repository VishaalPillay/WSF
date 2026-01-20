import 'dart:async';
import 'dart:typed_data';
import 'package:flutter/services.dart';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:record/record.dart';

class AudioSentinelService {
  Interpreter? _interpreter;
  final AudioRecorder _audioRecorder = AudioRecorder();
  StreamSubscription? _audioSubscription;

  // Logic Control
  bool isListening = false;
  Function(String event, double confidence)? onDangerDetected;

  // YAMNet Specifications (DO NOT CHANGE)
  final int sampleRate = 16000;
  final int requiredSamples = 15600; // 0.975 seconds of audio
  List<String> _labels = [];
  List<double> _audioBuffer = [];

  // 🚨 DANGER ZONES: Keywords to trigger alert
  final List<String> _dangerKeywords = [
    'Scream',
    'Shout',
    'Yell',
    'Screaming',
    'Explosion',
    'Glass',
    'Shatter',
    'Crying, sobbing',
    'Help'
  ];

  Future<void> initialize() async {
    try {
      // 1. Load Model
      _interpreter =
          await Interpreter.fromAsset('assets/sentinel_audio.tflite');
      print("✅ YAMNet Loaded Successfully");

      // 2. Load Labels
      final labelData = await rootBundle.loadString('assets/labels.txt');
      _labels = labelData.split('\n');
      print("✅ Loaded ${_labels.length} Audio Labels");
    } catch (e) {
      print("❌ Model Load Error: $e");
    }
  }

  Future<void> startListening() async {
    if (_interpreter == null || isListening) return;

    if (await _audioRecorder.hasPermission()) {
      isListening = true;
      _audioBuffer = [];

      // Start streaming raw PCM data (16-bit integer)
      final stream = await _audioRecorder.startStream(
        const RecordConfig(
          encoder: AudioEncoder.pcm16bits,
          sampleRate: 16000,
          numChannels: 1,
        ),
      );

      _audioSubscription = stream.listen((data) {
        _processAudioChunk(data);
      });
    }
  }

  void stopListening() {
    isListening = false;
    _audioRecorder.stop();
    _audioSubscription?.cancel();
    _audioBuffer.clear();
  }

  // Convert bytes to float and buffer them
  void _processAudioChunk(Uint8List data) {
    // PCM16 is 2 bytes per sample.
    for (int i = 0; i < data.length; i += 2) {
      if (i + 1 < data.length) {
        int byte1 = data[i];
        int byte2 = data[i + 1];

        // Convert to 16-bit signed integer
        int s16 = (byte2 << 8) | byte1;
        if (s16 > 32767) s16 -= 65536;

        // Normalize to Float [-1.0, 1.0]
        _audioBuffer.add(s16 / 32768.0);
      }
    }

    // Check if we have enough data for inference
    if (_audioBuffer.length >= requiredSamples) {
      // Take exact chunk
      var inputChunk = _audioBuffer.sublist(0, requiredSamples);

      // Remove handled data (Clear 50% for overlap)
      _audioBuffer.removeRange(0, (requiredSamples / 2).floor());

      _runInference(inputChunk);
    }
  }

  void _runInference(List<double> inputData) {
    if (_interpreter == null) return;

    // YAMNet Input Shape: [1, 15600]
    var input = [inputData];

    // YAMNet Output Shape: [1, 521]
    var output = List.filled(521, 0.0).reshape([1, 521]);

    try {
      _interpreter!.run(input, output);

      // Analyze results
      List<double> scores = output[0];
      double maxScore = 0;
      int maxIndex = -1;

      for (int i = 0; i < scores.length; i++) {
        if (scores[i] > maxScore) {
          maxScore = scores[i];
          maxIndex = i;
        }
      }

      if (maxIndex != -1) {
        String detectedLabel =
            _labels.length > maxIndex ? _labels[maxIndex] : "Unknown";

        // Debug print to see what phone is hearing
        if (maxScore > 0.3) {
          print("🎤 Heard: $detectedLabel ($maxScore)");
        }

        // Logic Check
        if (maxScore > 0.45) {
          // Confidence Threshold
          for (var danger in _dangerKeywords) {
            if (detectedLabel.contains(danger)) {
              print("🚨 DANGER MATCH: $detectedLabel");
              onDangerDetected?.call(detectedLabel, maxScore);
              return; // Trigger once per chunk
            }
          }
        }
      }
    } catch (e) {
      print("Inference Error: $e");
    }
  }
}