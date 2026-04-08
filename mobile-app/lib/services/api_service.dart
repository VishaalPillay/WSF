import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart'; //

class ApiService {
  // Base URL is now dynamic based on environment
  final String _baseUrl = dotenv.env['BACKEND_API_BASE_URL'] ?? 'http://localhost:8000';

  Future<List<dynamic>> getDangerZones({int? simulatedHour}) async {
    String urlString = '$_baseUrl/zones';
    if (simulatedHour != null) {
      urlString += '?simulated_hour=$simulatedHour';
    }

    final url = Uri.parse(urlString);

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['zones'] ?? [];
      } else {
        print('⚠️ Zone Error: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('❌ Connection Error: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> getSafeRoute(
      double startLat, double startLng, double endLat, double endLng) async {
    final url = Uri.parse('$_baseUrl/get-safe-route');

    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "start_lat": startLat,
          "start_lng": startLng,
          "end_lat": endLat,
          "end_lng": endLng,
          "user_id": "mac_user_01"
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print('⚠️ Route Error: ${response.body}');
        return null;
      }
    } catch (e) {
      print('❌ Route Connection Error: $e');
      return null;
    }
  }
}