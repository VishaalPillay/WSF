import 'dart:convert';
import 'package:http/http.dart' as http;

class MapboxService {
  // Hardcoded for Hackathon velocity - ideally move to .env
  final String _accessToken =
      "pk.eyJ1IjoibmlraGlsMjEwMjA2IiwiYSI6ImNta2U0NG0zdTAzMzUzZXMwZjZwbXFzZ3kifQ.fgjpDhGp_9bUapwaLEvtsg";

  Future<List<Map<String, dynamic>>> getSuggestions(String query) async {
    if (query.isEmpty) return [];

    // Vellore BBOX: minLon,minLat,maxLon,maxLat
    // Proximity: VIT Vellore (79.1559, 12.9692)
    final url = Uri.parse(
        "https://api.mapbox.com/geocoding/v5/mapbox.places/$query.json?access_token=$_accessToken&autocomplete=true&limit=5&country=in&proximity=79.1559,12.9692&bbox=78.5,12.5,79.5,13.5");

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
