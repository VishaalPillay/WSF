import 'dart:convert';

import 'package:http/http.dart' as http;

class ApiService {
  final String _baseUrl = 'http://192.168.1.10:8000';

  // Fetch Danger Zones (Incidents)
  Future<List<dynamic>> getDangerZones() async {
    // Optional: You can pass ?simulated_hour=22 to test night mode
    final url = Uri.parse('$_baseUrl/zones');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // The backend returns { "zones": [...] }
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
}
