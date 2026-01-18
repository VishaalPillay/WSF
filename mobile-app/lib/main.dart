import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'screens/login_screen.dart'; 

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Pass your Mapbox Token here. 
  MapboxOptions.setAccessToken("pk.eyJ1IjoibmlraGlsMjEwMjA2IiwiYSI6ImNta2U0NG0zdTAzMzUzZXMwZjZwbXFzZ3kifQ.fgjpDhGp_9bUapwaLEvtsg");

  runApp(const SentraApp());
}

class SentraApp extends StatelessWidget {
  const SentraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SENTRA',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        // Ensure the seed color matches our new Pink theme
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFFF4081)),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}