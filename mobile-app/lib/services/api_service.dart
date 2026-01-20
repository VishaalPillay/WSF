import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String _baseUrl = 'http://172.20.10.2:8000';

  // UPDATED: Now accepts a simulated hour (e.g., 22 for 10 PM)
  Future<List<dynamic>> getDangerZones({int? simulatedHour}) async {
    // Build the URL with the simulation parameter if provided
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
