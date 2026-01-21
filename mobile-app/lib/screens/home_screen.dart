import 'dart:math' as math;
import 'package:flutter/material.dart';
// 1. HIDE 'Size' from Mapbox to avoid conflict with Flutter's Size
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart' hide Size;
import 'package:permission_handler/permission_handler.dart';
import 'package:sliding_up_panel/sliding_up_panel.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/services/mapbox_service.dart';
import 'dart:async';
import 'package:url_launcher/url_launcher.dart';
import 'package:mobile_app/services/audio_sentinel_service.dart';
import 'package:geolocator/geolocator.dart'
    as geo; // ✅ Aliased to avoid conflict

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  MapboxMap? mapboxMap;
  PolygonAnnotationManager? _polygonManager;
  PolylineAnnotationManager? _polylineManager;
  PointAnnotationManager? _pointManager;

  final ApiService _apiService = ApiService();
  final MapboxService _mapboxService = MapboxService();

  // Audio Sentinel Service
  final AudioSentinelService _audioSentinel = AudioSentinelService();

  // Text Controllers
  final TextEditingController _startController = TextEditingController();
  final TextEditingController _destinationController = TextEditingController();

  // Focus Nodes
  final FocusNode _startFocus = FocusNode();
  final FocusNode _destinationFocus = FocusNode();
  Timer? _debounce;

  // Coordinates
  double _startLat = 12.9692; // Default: VIT
  double _startLng = 79.1559;
  double? _destLat;
  double? _destLng;

  // Suggestions State
  List<Map<String, dynamic>> _suggestions = [];
  bool _isSearching = false;

  // State Variables
  bool _isRouteActive = false;
  bool _isInputExpanded = false;
  bool _isNightMode = false;
  int _riskScore = 0;
  double _durationMin = 0;

  // ✅ NEW: Zone Logic Variables
  List<dynamic> _activeZones = []; // Stores current zones for calculation
  String _safetyStatusTitle = "SENTRA ACTIVE";
  String _safetyStatusSubtitle = "You are in a Safe Zone";
  List<Color> _safetyGradient = [
    const Color(0xFF2C3E50),
    const Color(0xFF4CA1AF)
  ]; // Default Green/Blue
  IconData _safetyIcon = Icons.shield_moon;

  @override
  void initState() {
    super.initState();
    _startController.text = "Current Location";
    _requestPermissions();
    _initAudioSentinel();
    _startLocationTracking(); // ✅ Start tracking "Blue Dot" logic
  }

  @override
  void dispose() {
    _startController.dispose();
    _destinationController.dispose();
    _startFocus.dispose();
    _destinationFocus.dispose();
    _debounce?.cancel();
    _audioSentinel.stopListening();
    super.dispose();
  }

  Future<void> _requestPermissions() async {
    await [
      Permission.location,
      Permission.microphone,
    ].request();
  }

  void _initAudioSentinel() async {
    await _audioSentinel.initialize();
    _audioSentinel.onDangerDetected = (event, confidence) {
      if (mounted && ModalRoute.of(context)?.isCurrent == true) {
        _handleSosSequence(triggerReason: event);
      }
    };
    _audioSentinel.startListening();
    setState(() {});
  }

  // ✅ NEW: Location Tracking & Safety Check Logic
  void _startLocationTracking() {
    const geo.LocationSettings locationSettings = geo.LocationSettings(
      accuracy: geo.LocationAccuracy.high,
      distanceFilter: 10, // Update every 10 meters
    );

    geo.Geolocator.getPositionStream(locationSettings: locationSettings).listen(
      (geo.Position position) {
        // Update user location variable if needed
        _startLat = position.latitude;
        _startLng = position.longitude;

        // Check if user is inside any danger zone
        _checkZoneSafety(position);
      },
    );
  }

  // ✅ NEW: Check if "Blue Dot" is inside a Red/Yellow Zone
  void _checkZoneSafety(geo.Position userPos) {
    bool inDanger = false;
    String severity = "LOW";

    // Iterate through loaded zones
    for (var zone in _activeZones) {
      if (zone['lat'] != null && zone['lng'] != null) {
        double zoneLat = zone['lat'];
        double zoneLng = zone['lng'];

        // Calculate distance between User and Zone Center
        double distanceInMeters = geo.Geolocator.distanceBetween(
          userPos.latitude,
          userPos.longitude,
          zoneLat,
          zoneLng,
        );

        // Check if inside the 300m radius
        if (distanceInMeters <= 300) {
          inDanger = true;
          severity = zone['severity'] ?? "HIGH";
          break; // Found a zone, break loop
        }
      }
    }

    // Update UI based on result
    if (mounted) {
      setState(() {
        if (inDanger) {
          if (severity == "MODERATE") {
            _safetyStatusTitle = "CAUTION ADVISED";
            _safetyStatusSubtitle = "Entered Moderate Risk Zone";
            _safetyGradient = [
              const Color(0xFFF2994A),
              const Color(0xFFF2C94C)
            ]; // Orange/Yellow
            _safetyIcon = Icons.warning_amber_rounded;
          } else {
            _safetyStatusTitle = "DANGER DETECTED";
            _safetyStatusSubtitle = "You are in a High Risk Zone";
            _safetyGradient = [
              const Color(0xFFCB2D3E),
              const Color(0xFFEF473A)
            ]; // Red
            _safetyIcon = Icons.report_problem_rounded;
          }
        } else {
          _safetyStatusTitle = "SENTRA ACTIVE";
          _safetyStatusSubtitle = "You are in a Safe Zone";
          _safetyGradient = _isNightMode
              ? [const Color(0xFF0F2027), const Color(0xFF203A43)]
              : [const Color(0xFF2C3E50), const Color(0xFF4CA1AF)];
          _safetyIcon = Icons.shield_moon;
        }
      });
    }
  }

  _onMapCreated(MapboxMap mapboxMap) {
    this.mapboxMap = mapboxMap;

    // ✅ NEW: Enable the Blue Dot (Location Component)
    mapboxMap.location.updateSettings(
      LocationComponentSettings(
        enabled: true,
        pulsingEnabled: true,
        pulsingColor: Colors.blueAccent.value,
        pulsingMaxRadius: 30.0,
      ),
    );

    // Initialize Annotation Managers
    mapboxMap.annotations.createPolygonAnnotationManager().then((manager) {
      _polygonManager = manager;
      _loadDangerZones();
    });
    mapboxMap.annotations.createPolylineAnnotationManager().then((manager) {
      _polylineManager = manager;
    });
    mapboxMap.annotations.createPointAnnotationManager().then((manager) {
      _pointManager = manager;
    });
  }

  // --- DANGER ZONES ---
  List<Position> _createGeoJSONCircle(
    double centerLat,
    double centerLng,
    double radiusInMeters,
  ) {
    int points = 64;
    List<Position> coordinates = [];
    double earthRadius = 6371000.0;
    for (int i = 0; i < points; i++) {
      double angle = (i * 360 / points) * (math.pi / 180);
      double latOffset = (radiusInMeters / earthRadius) * (180 / math.pi);
      double lngOffset = (radiusInMeters / earthRadius) *
          (180 / math.pi) /
          math.cos(centerLat * math.pi / 180);
      double pLat = centerLat + (latOffset * math.sin(angle));
      double pLng = centerLng + (lngOffset * math.cos(angle));
      coordinates.add(Position(pLng, pLat));
    }
    coordinates.add(coordinates.first);
    return coordinates;
  }

  Future<void> _loadDangerZones() async {
    int simulatedTime = _isNightMode ? 22 : 10;
    await _polygonManager?.deleteAll();

    final zones = await _apiService.getDangerZones(
      simulatedHour: simulatedTime,
    );

    // ✅ NEW: Store raw zones for distance calculation
    _activeZones = zones;

    // Trigger an immediate check in case user is already in one
    geo.Position? currentPos = await geo.Geolocator.getLastKnownPosition();
    if (currentPos != null) _checkZoneSafety(currentPos);

    if (zones.isEmpty) return;

    List<PolygonAnnotationOptions> polygonOptions = [];
    for (var zone in zones) {
      if (zone['lat'] != null && zone['lng'] != null) {
        String severity = zone['severity'] ?? 'HIGH';
        int activeFillColor = severity == 'MODERATE'
            ? Colors.amber.withOpacity(0.25).value
            : Colors.red.withOpacity(0.25).value;
        int activeStrokeColor = severity == 'MODERATE'
            ? Colors.amber.withOpacity(0.8).value
            : Colors.red.withOpacity(0.8).value;
        final geometry = _createGeoJSONCircle(zone['lat'], zone['lng'], 300);
        polygonOptions.add(
          PolygonAnnotationOptions(
            geometry: Polygon(coordinates: [geometry]),
            fillColor: activeFillColor,
            fillOutlineColor: activeStrokeColor,
          ),
        );
      }
    }
    await _polygonManager?.createMulti(polygonOptions);
  }

  // --- SOS LOGIC ---
  void _handleSosSequence({String? triggerReason}) async {
    bool shouldSend = await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) =>
              SosCountdownDialog(triggerReason: triggerReason),
        ) ??
        false;

    if (shouldSend) {
      _launchSmsApp();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("SOS Cancelled"),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  Future<void> _launchSmsApp() async {
    const String emergencyNumber = "+919940903891";
    // ✅ Updated to send actual coordinates if available
    final String message =
        "SOS! I need help. My current location is: https://maps.google.com/?q=$_startLat,$_startLng";

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Opening SMS App..."),
        backgroundColor: Colors.redAccent,
        duration: Duration(seconds: 2),
      ),
    );

    final Uri smsUri = Uri(
      scheme: 'sms',
      path: emergencyNumber,
      queryParameters: <String, String>{'body': message},
    );
    if (await canLaunchUrl(smsUri)) {
      await launchUrl(smsUri);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Could not launch SMS app."),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // --- ROUTE LOGIC ---
  void _handleMapTap(MapContentGestureContext context) {
    final point = context.point;
    final double lat = point.coordinates.lat.toDouble();
    final double lng = point.coordinates.lng.toDouble();

    setState(() {
      _isInputExpanded = true;
      _destLat = lat;
      _destLng = lng;
      _destinationController.text =
          "${lat.toStringAsFixed(4)}, ${lng.toStringAsFixed(4)}";
    });

    _fetchAndDrawRoute(lat, lng);
  }

  void _onSearchChanged(String query, bool isStart) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      if (query.length < 3) {
        setState(() => _suggestions = []);
        return;
      }
      setState(() => _isSearching = true);
      final results = await _mapboxService.getSuggestions(query);
      if (mounted) {
        setState(() {
          _suggestions = results;
          _isSearching = false;
        });
      }
    });
  }

  void _selectSuggestion(Map<String, dynamic> suggestion, bool isStart) {
    final center = suggestion['center'];
    final double lng = center[0];
    final double lat = center[1];
    final String name = suggestion['place_name'];

    setState(() {
      if (isStart) {
        _startLat = lat;
        _startLng = lng;
        _startController.text = name;
        _startFocus.unfocus();
      } else {
        _destLat = lat;
        _destLng = lng;
        _destinationController.text = name;
        _destinationFocus.unfocus();
      }
      _suggestions = [];
    });

    if (_destLat != null) {
      _fetchAndDrawRoute(_destLat!, _destLng!);
    }
  }

  Future<void> _fetchAndDrawRoute(double endLat, double endLng) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Calculating safest path..."),
        duration: Duration(seconds: 1),
      ),
    );
    await _polylineManager?.deleteAll();
    await _pointManager?.deleteAll();

    final result = await _apiService.getSafeRoute(
      _startLat,
      _startLng,
      endLat,
      endLng,
    );

    if (result != null && result['status'] == 'success') {
      final route = result['recommended_route'];
      final String encodedPolyline = route['route_geometry'];
      final int safetyScore = route['safety_score'];
      final double duration = route['duration'] / 60;

      PolylinePoints polylinePoints = PolylinePoints();
      List<PointLatLng> decodedPoints = polylinePoints.decodePolyline(
        encodedPolyline,
      );
      List<Position> routeGeometry =
          decodedPoints.map((p) => Position(p.longitude, p.latitude)).toList();

      _polylineManager?.create(
        PolylineAnnotationOptions(
          geometry: LineString(coordinates: routeGeometry),
          lineColor: Colors.blueAccent.value,
          lineWidth: 6.0,
          lineJoin: LineJoin.ROUND,
        ),
      );

      _pointManager?.create(
        PointAnnotationOptions(
          geometry: Point(coordinates: Position(endLng, endLat)),
          iconImage: "marker-15",
          iconSize: 1.5,
        ),
      );

      setState(() {
        _isRouteActive = true;
        _riskScore = 100 - safetyScore;
        _durationMin = duration;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Could not find a route!")));
    }
  }

  void _toggleSimulationMode() {
    setState(() {
      _isNightMode = !_isNightMode;
      // Reset to safe default until new zones load
      if (!_activeZones.any((z) => z['severity'] != null)) {
        _safetyGradient = _isNightMode
            ? [const Color(0xFF0F2027), const Color(0xFF203A43)]
            : [const Color(0xFF2C3E50), const Color(0xFF4CA1AF)];
      }
    });

    if (mapboxMap != null) {
      mapboxMap!.loadStyleURI(
        _isNightMode ? MapboxStyles.DARK : MapboxStyles.MAPBOX_STREETS,
      );
      Future.delayed(const Duration(milliseconds: 300), () {
        _loadDangerZones();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SlidingUpPanel(
        maxHeight: 450,
        minHeight: 180,
        parallaxEnabled: true,
        parallaxOffset: .5,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24.0),
          topRight: Radius.circular(24.0),
        ),
        panel: _buildBottomSheet(),
        body: Stack(
          children: [
            MapWidget(
              key: const ValueKey("mapWidget"),
              cameraOptions: CameraOptions(
                center: Point(coordinates: Position(_startLng, _startLat)),
                zoom: 13.5,
              ),
              styleUri: _isNightMode
                  ? MapboxStyles.DARK
                  : MapboxStyles.MAPBOX_STREETS,
              onMapCreated: _onMapCreated,
              onTapListener: _handleMapTap,
            ),
            _buildAnimatedSearchPanel(),
          ],
        ),
      ),
      bottomNavigationBar: _buildNavBar(),
    );
  }

  Widget _buildAnimatedSearchPanel() {
    return Positioned(
      top: 55,
      left: 15,
      right: 15,
      child: GestureDetector(
        onTap: () {
          if (!_isInputExpanded) setState(() => _isInputExpanded = true);
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOutCubic,
          height: _isInputExpanded
              ? 160 + (_suggestions.length * 55).toDouble()
              : 55,
          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.12),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: SingleChildScrollView(
              physics: const NeverScrollableScrollPhysics(),
              child: _isInputExpanded
                  ? _buildExpandedInputs()
                  : _buildCollapsedInput(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCollapsedInput() {
    return Row(
      key: const ValueKey("collapsed"),
      children: [
        const Icon(Icons.search, color: Color(0xFFFF4081), size: 24),
        const SizedBox(width: 15),
        Text(
          "Where to?",
          style: GoogleFonts.poppins(
            color: Colors.black87,
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
        const Spacer(),
        Container(
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            shape: BoxShape.circle,
          ),
          child: Icon(
            _audioSentinel.isListening ? Icons.mic : Icons.mic_off,
            size: 18,
            color: _audioSentinel.isListening ? Colors.redAccent : Colors.grey,
          ),
        ),
      ],
    );
  }

  Widget _buildExpandedInputs() {
    return Column(
      key: const ValueKey("expanded"),
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Row(
          children: [
            GestureDetector(
              onTap: () {
                setState(() => _isInputExpanded = false);
                _startFocus.unfocus();
                _destinationFocus.unfocus();
                _suggestions = [];
              },
              child:
                  const Icon(Icons.arrow_back, color: Colors.black87, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              children: [
                const Icon(Icons.circle, color: Colors.blue, size: 10),
                Container(
                  height: 20,
                  width: 2,
                  color: Colors.grey[300],
                  margin: const EdgeInsets.symmetric(vertical: 2),
                ),
              ],
            ),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: _startController,
                focusNode: _startFocus,
                onChanged: (val) => _onSearchChanged(val, true),
                decoration: InputDecoration(
                  hintText: "Start Location",
                  hintStyle: GoogleFonts.poppins(color: Colors.grey[400]),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
                style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w500, fontSize: 14),
              ),
            ),
          ],
        ),
        Divider(color: Colors.grey[200], height: 20, thickness: 1),
        Row(
          children: [
            const SizedBox(width: 30),
            const Icon(Icons.location_on_rounded,
                color: Color(0xFFFF4081), size: 16),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: _destinationController,
                focusNode: _destinationFocus,
                onChanged: (val) => _onSearchChanged(val, false),
                autofocus: true,
                decoration: InputDecoration(
                  hintText: "Where to?",
                  hintStyle: GoogleFonts.poppins(color: Colors.grey[400]),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
                style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w600, fontSize: 14),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.map_outlined, color: Colors.blue),
              tooltip: "Choose on Map",
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              onPressed: () {
                setState(() => _isInputExpanded = false);
                _startFocus.unfocus();
                _destinationFocus.unfocus();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text("Tap on the map to select destination"),
                    duration: Duration(seconds: 2),
                    backgroundColor: Colors.blue,
                  ),
                );
              },
            ),
          ],
        ),
        if (_suggestions.isNotEmpty) ...[
          const Divider(),
          _buildSuggestionsList(),
        ],
      ],
    );
  }

  Widget _buildSuggestionsList() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: _suggestions.map((suggestion) {
        return ListTile(
          dense: true,
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.location_on_outlined,
              size: 20, color: Colors.grey),
          title: Text(
            suggestion['place_name'] ?? "",
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.poppins(fontSize: 13),
          ),
          onTap: () {
            bool isStart = _startFocus.hasFocus;
            _selectSuggestion(suggestion, isStart);
          },
        );
      }).toList(),
    );
  }

  Widget _buildBottomSheet() {
    if (_isRouteActive) {
      return SingleChildScrollView(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              height: 100,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: _riskScore > 50
                      ? [const Color(0xFFCB2D3E), const Color(0xFFEF473A)]
                      : [const Color(0xFF11998e), const Color(0xFF38ef7d)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _riskScore > 50 ? "CAUTION ADVISED" : "SAFEST ROUTE",
                        style: GoogleFonts.poppins(
                          color: Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                      Text(
                        "${_durationMin.toStringAsFixed(0)} mins • Risk: $_riskScore%",
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const Icon(Icons.directions_walk,
                      color: Colors.white, size: 40),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.info_outline, color: Colors.blue),
              title: Text(
                "Route Details",
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
              ),
              subtitle: Text(
                "This path avoids ${_riskScore > 0 ? 'detected high-crime zones' : 'all known danger zones'}.",
                style: GoogleFonts.poppins(fontSize: 12),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isRouteActive = false;
                    _isInputExpanded = false;
                    _destinationController.clear();
                    _polylineManager?.deleteAll();
                    _pointManager?.deleteAll();
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black87,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  "Clear Route",
                  style: GoogleFonts.poppins(
                      color: Colors.white, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      );
    }

    // ✅ UPDATED: Dynamic Status Panel based on Zone
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 500),
            width: double.infinity,
            height: 90,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _safetyGradient, // ✅ Dynamic Colors
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      children: [
                        Icon(_safetyIcon,
                            color: Colors.white, size: 18), // ✅ Dynamic Icon
                        const SizedBox(width: 8),
                        Text(
                          _safetyStatusTitle, // ✅ Dynamic Title
                          style: GoogleFonts.poppins(
                            color: Colors.white70,
                            fontSize: 12,
                            letterSpacing: 1.5,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _safetyStatusSubtitle, // ✅ Dynamic Subtitle
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Icon(Icons.battery_saver,
                    color: Colors.white70, size: 28),
              ],
            ),
          ),

          const SizedBox(height: 25),

          // --- TIME SIMULATION SLIDER ---
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Simulation Mode",
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: _toggleSimulationMode,
                  child: Container(
                    width: double.infinity,
                    height: 55,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(30),
                      color: Colors.grey[200],
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Stack(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            Expanded(
                              child: Center(
                                child: Text(
                                  "Day Time",
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: !_isNightMode
                                        ? Colors.black54
                                        : Colors.grey,
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: Center(
                                child: Text(
                                  "Night Time",
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: _isNightMode
                                        ? Colors.black54
                                        : Colors.grey,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        AnimatedAlign(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeOutBack,
                          alignment: _isNightMode
                              ? Alignment.centerRight
                              : Alignment.centerLeft,
                          child: Container(
                            width: 160,
                            height: 45,
                            margin: const EdgeInsets.symmetric(horizontal: 5),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: _isNightMode
                                    ? [
                                        const Color(0xFF2b5876),
                                        const Color(0xFF4e4376)
                                      ]
                                    : [
                                        const Color(0xFFF2994A),
                                        const Color(0xFFF2C94C)
                                      ],
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                              borderRadius: BorderRadius.circular(25),
                              boxShadow: [
                                BoxShadow(
                                  color: _isNightMode
                                      ? Colors.purple.withOpacity(0.3)
                                      : Colors.orange.withOpacity(0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  _isNightMode
                                      ? Icons.nights_stay_rounded
                                      : Icons.wb_sunny_rounded,
                                  color: Colors.white,
                                  size: 20,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  _isNightMode ? "Night View" : "Day View",
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 25),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 25),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Safe Havens Nearby",
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 15),
                _buildSafePlaceTile("Katpadi Station", "0.5 km • Open 24x7"),
                _buildSafePlaceTile(
                    "VIT Main Gate", "1.2 km • Security Present"),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavBar() {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 0,
        selectedItemColor: const Color(0xFFFF4081),
        unselectedItemColor: Colors.grey[400],
        showUnselectedLabels: true,
        selectedLabelStyle: GoogleFonts.poppins(
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.poppins(fontSize: 12),
        onTap: (index) {
          if (index == 1) {
            _handleSosSequence();
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded, size: 28),
            label: "Home",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.emergency_rounded, color: Colors.red, size: 36),
            label: "SOS",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded, size: 28),
            label: "Profile",
          ),
        ],
      ),
    );
  }

  Widget _buildSafePlaceTile(String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(10),
            ),
            child:
                Icon(Icons.store_rounded, color: Colors.green[700], size: 22),
          ),
          const SizedBox(width: 15),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          const Spacer(),
          const Icon(Icons.directions_outlined, color: Colors.grey, size: 20),
        ],
      ),
    );
  }
}

class SosCountdownDialog extends StatefulWidget {
  final String? triggerReason;
  const SosCountdownDialog({super.key, this.triggerReason});

  @override
  State<SosCountdownDialog> createState() => _SosCountdownDialogState();
}

class _SosCountdownDialogState extends State<SosCountdownDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  int _countdown = 10;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_countdown > 1) {
          _countdown--;
        } else {
          _timer?.cancel();
          Navigator.of(context).pop(true);
        }
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Dialog(
        backgroundColor: Colors.transparent,
        elevation: 0,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.redAccent,
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: Colors.redAccent.withOpacity(0.5),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Colors.white),
                  const SizedBox(width: 8),
                  Text(
                    widget.triggerReason != null
                        ? "DANGER DETECTED"
                        : "EMERGENCY ALERT",
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            ),
            if (widget.triggerReason != null) ...[
              const SizedBox(height: 10),
              Text(
                "Heard: ${widget.triggerReason}",
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
              ),
            ],
            const SizedBox(height: 30),
            Stack(
              alignment: Alignment.center,
              children: [
                AnimatedBuilder(
                  animation: _controller,
                  builder: (context, child) {
                    return Container(
                      width: 180 + (_controller.value * 20),
                      height: 180 + (_controller.value * 20),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.red.withOpacity(
                          0.2 - (_controller.value * 0.1),
                        ),
                        border: Border.all(
                          color: Colors.red.withOpacity(0.5),
                          width: 1,
                        ),
                      ),
                    );
                  },
                ),
                SizedBox(
                  width: 160,
                  height: 160,
                  child: CircularProgressIndicator(
                    value: _countdown / 10,
                    valueColor: const AlwaysStoppedAnimation(Colors.red),
                    backgroundColor: Colors.white24,
                    strokeWidth: 8,
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      "$_countdown",
                      style: GoogleFonts.poppins(
                        fontSize: 60,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      "Sending SOS...",
                      style: GoogleFonts.poppins(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 40),
            GestureDetector(
              onTap: () {
                _timer?.cancel();
                Navigator.of(context).pop(false);
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: Text(
                    widget.triggerReason != null
                        ? "I AM SAFE (CANCEL)"
                        : "CANCEL REQUEST",
                    style: GoogleFonts.poppins(
                      color: Colors.redAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      letterSpacing: 1.1,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
