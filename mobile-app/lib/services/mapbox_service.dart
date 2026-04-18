import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart'; //

class MapboxService {
  // Token is now retrieved from environment variables
  final String _accessToken = dotenv.env['MAPBOX_ACCESS_TOKEN'] ?? ""; 

  Future<List<Map<String, dynamic>>> getSuggestions(String query) async {
    if (query.isEmpty) return [];

    // Chennai/SRM BBOX: minLon,minLat,maxLon,maxLat
    // Proximity: SRM University Kattankulathur (80.0444, 12.8230)
    final url = Uri.parse(
        "https://api.mapbox.com/geocoding/v5/mapbox.places/$query.json?access_token=$_accessToken&autocomplete=true&limit=5&country=in&proximity=80.0444,12.8230&bbox=79.80,12.60,80.40,13.35");

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> features = data['features'];

        return features.map((feature) {
          return {
            'place_name': feature['place_name'],
            'center': feature['center'], // [lng, lat]
          };
        }).toList();
      } else {
        print("Mapbox API Error: ${response.statusCode}");
        return [];
      }
    } catch (e) {
      print("Error fetching suggestions: $e");
      return [];
    }
  }
}