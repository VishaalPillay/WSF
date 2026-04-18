import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/login_screen.dart'; 

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  await dotenv.load(fileName: ".env");

  final mapboxToken = dotenv.env['MAPBOX_ACCESS_TOKEN'] ?? '';
  if (mapboxToken.isNotEmpty) {
    MapboxOptions.setAccessToken(mapboxToken);
  }
  
  // Initialize Supabase
  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL'] ?? '',
    anonKey: dotenv.env['SUPABASE_ANON_KEY'] ?? '',
  );
  
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