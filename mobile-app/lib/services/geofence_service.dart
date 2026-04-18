import 'dart:async';
import 'dart:math' as math;
import 'package:flutter_background_geolocation/flutter_background_geolocation.dart' as bg;
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart' hide Size;
import 'package:supabase_flutter/supabase_flutter.dart';

class GeofenceService {
  static final GeofenceService _instance = GeofenceService._internal();
  factory GeofenceService() => _instance;
  GeofenceService._internal();

  Timer? _driftTimer;
  List<Position>? _expectedRoute;
  String? _activeTripId;
  final _supabase = Supabase.instance.client;

  // Callbacks for UI
  Function()? onDriftAlert;
  Function(bg.GeofenceEvent)? onDangerZoneTrigger;

  Future<void> initialize() async {
    bg.BackgroundGeolocation.onLocation(_onLocation);
    bg.BackgroundGeolocation.onGeofence(_onGeofence);

    await bg.BackgroundGeolocation.ready(bg.Config(
      desiredAccuracy: bg.Config.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10.0, // High-resolution tracking, pinging every 10 meters
      stopOnTerminate: true,
      startOnBoot: false,
      debug: false, // Turn off BG logging popup
      logLevel: bg.Config.LOG_LEVEL_OFF,
    ));
  }

  void setupPolygons(List<dynamic> activeZones) async {
    await bg.BackgroundGeolocation.removeGeofences();
    List<bg.Geofence> bgGeofences = [];
    
    int index = 0;
    for (var zone in activeZones) {
       if (zone['boundary'] != null && zone['boundary']['type'] == 'Polygon') {
          List<dynamic> ringData = zone['boundary']['coordinates'][0];
          
          // flutter_background_geolocation expects vertices as [lat, lng]
          List<List<double>> vertices = ringData.map<List<double>>((pt) {
            return <double>[pt[1].toDouble(), pt[0].toDouble()];
          }).toList();

          bgGeofences.add(bg.Geofence(
            identifier: 'danger_zone_${index++}',
            vertices: vertices,
            notifyOnEntry: true,
            notifyOnExit: true,
            extras: {
               'risk_level': zone['risk_level'] ?? 'red',
            }
          ));
       }
    }
    
    if (bgGeofences.isNotEmpty) {
      await bg.BackgroundGeolocation.addGeofences(bgGeofences);
    }
  }

  Future<void> startTripTracker(String tripId, List<Position> route) async {
    _activeTripId = tripId;
    _expectedRoute = route;
    _driftTimer?.cancel();
    await bg.BackgroundGeolocation.start();
  }

  Future<void> stopTripTracker() async {
    _activeTripId = null;
    _expectedRoute = null;
    _driftTimer?.cancel();
    await bg.BackgroundGeolocation.stop();
  }

  void _onGeofence(bg.GeofenceEvent event) {
    if (onDangerZoneTrigger != null) {
      onDangerZoneTrigger!(event);
    }
  }

  void _onLocation(bg.Location location) {
    if (_expectedRoute == null || _expectedRoute!.isEmpty || _activeTripId == null) return;

    double userLat = location.coords.latitude;
    double userLng = location.coords.longitude;

    // Send the PostGIS Ping payload!
    try {
      _supabase.from('trip_pings').insert({
        'trip_id': _activeTripId,
        'current_location': 'SRID=4326;POINT($userLng $userLat)',
      });
    } catch (e) {
      print('Failed to send trip ping: $e');
    }

    // Cross-track error (perpendicular drift distance)
    double currentDrift = _minDistanceToRoute(userLat, userLng, _expectedRoute!);

    if (currentDrift > 50.0) {
      if (_driftTimer == null || !_driftTimer!.isActive) {
        // Start the 30s countdown
        _driftTimer = Timer(const Duration(seconds: 30), () {
          if (onDriftAlert != null) {
            onDriftAlert!();
          }
        });
      }
    } else {
      // User corrected their path to within 50m!
      if (_driftTimer != null && _driftTimer!.isActive) {
        _driftTimer!.cancel();
      }
    }
  }

  double _minDistanceToRoute(double lat, double lng, List<Position> route) {
     double minDistance = double.infinity;
     for(int i = 0; i < route.length - 1; i++) {
        double dist = _distanceToSegment(
            lat, lng, 
            route[i].lat.toDouble(), route[i].lng.toDouble(), 
            route[i+1].lat.toDouble(), route[i+1].lng.toDouble()
        ); 
        if (dist < minDistance) minDistance = dist;
     }
     return minDistance;
  }

  double _distanceToSegment(double px, double py, double ax, double ay, double bx, double by) {
    // Equirectangular approximation
    double latToM = 111320.0;
    double lngToM = 111320.0 * math.cos(py * math.pi / 180.0);

    double x = (px - ax) * latToM;
    double y = (py - ay) * lngToM;
    double dx = (bx - ax) * latToM;
    double dy = (by - ay) * lngToM;

    double dot = x * dx + y * dy;
    double lenSq = dx * dx + dy * dy;

    double param = -1.0;
    if (lenSq != 0) {
      param = dot / lenSq;
    }

    double xx, yy;

    if (param < 0) {
      xx = ax * latToM;
      yy = ay * lngToM;
    } else if (param > 1) {
      xx = bx * latToM;
      yy = by * lngToM;
    } else {
      xx = ax * latToM + param * dx;
      yy = ay * lngToM + param * dy;
    }

    double ddx = (px * latToM) - xx;
    double ddy = (py * lngToM) - yy;
    
    return math.sqrt(ddx * ddx + ddy * ddy);
  }
}
