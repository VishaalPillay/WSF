import 'package:flutter/material.dart';

import 'screens/login_screen.dart'; 

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Use a fallback or env variable instead of the hardcoded key
  final String mapboxToken = String.fromEnvironment('MAPBOX_ACCESS_TOKEN');
  MapboxOptions.setAccessToken(mapboxToken);

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