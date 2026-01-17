import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // ⚠️ CHANGE THIS based on your device (See note above)
  // Mac (iOS Simulator): 'http://127.0.0.1:8000'
  // Windows/Android Emulator: 'http://10.0.2.2:8000'
  final String _baseUrl = 'http://192.168.1.10:8000'; 

  // Fetch Danger Zones
  Future<List<dynamic>> getDangerZones() async {
    final url = Uri.parse('$_baseUrl/zones');
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

  // 🔥 NEW: Connects to your friend's backend route logic
  Future<Map<String, dynamic>?> getSafeRoute(double startLat, double startLng, double endLat, double endLng) async {
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