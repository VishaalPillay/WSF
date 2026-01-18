import 'dart:math' as math;
import 'package:flutter/material.dart';
// 1. HIDE 'Size' from Mapbox to avoid conflict with Flutter's Size
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart' hide Size;
import 'package:permission_handler/permission_handler.dart';
import 'package:sliding_up_panel/sliding_up_panel.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:mobile_app/services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  MapboxMap? mapboxMap;
  PolygonAnnotationManager? _polygonManager;
  PolylineAnnotationManager? _polylineManager;
  PointAnnotationManager? _pointManager;

  final ApiService _apiService = ApiService();

  // Text Controllers
  final TextEditingController _startController = TextEditingController();
  final TextEditingController _destinationController = TextEditingController();

  // VIT Vellore Coordinates
  final double startLat = 12.9692;
  final double startLng = 79.1559;

  // State Variables
  bool _isRouteActive = false;
  bool _isInputExpanded = false; // Controls the animation state
  int _riskScore = 0;
  double _durationMin = 0;

  @override
  void initState() {
    super.initState();
    _startController.text = "Current Location";
    _requestPermissions();
  }

  @override
  void dispose() {
    _startController.dispose();
    _destinationController.dispose();
    super.dispose();
  }

  Future<void> _requestPermissions() async {
    await [Permission.location, Permission.microphone].request();
  }

  _onMapCreated(MapboxMap mapboxMap) {
    this.mapboxMap = mapboxMap;
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

  // --- 1. DANGER ZONES ---
  List<Position> _createGeoJSONCircle(
      double centerLat, double centerLng, double radiusInMeters) {
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
    final zones = await _apiService.getDangerZones();
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
        polygonOptions.add(PolygonAnnotationOptions(
          geometry: Polygon(coordinates: [geometry]),
          fillColor: activeFillColor,
          fillOutlineColor: activeStrokeColor,
        ));
      }
    }
    await _polygonManager?.createMulti(polygonOptions);
  }

  // --- 2. ROUTE LOGIC ---
  void _handleMapTap(MapContentGestureContext context) {
    final point = context.point;
    final double lat = point.coordinates.lat.toDouble();
    final double lng = point.coordinates.lng.toDouble();

    print("📍 Destination Tapped: $lat, $lng");

    setState(() {
      _isInputExpanded = true; // Auto-expand when map is tapped
      _destinationController.text =
          "${lat.toStringAsFixed(4)}, ${lng.toStringAsFixed(4)}";
    });

    _fetchAndDrawRoute(lat, lng);
  }

  Future<void> _fetchAndDrawRoute(double endLat, double endLng) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text("Calculating safest path..."),
          duration: Duration(seconds: 1)),
    );
    await _polylineManager?.deleteAll();
    await _pointManager?.deleteAll();

    final result =
        await _apiService.getSafeRoute(startLat, startLng, endLat, endLng);

    if (result != null && result['status'] == 'success') {
      final route = result['recommended_route'];
      final String encodedPolyline = route['route_geometry'];
      final int safetyScore = route['safety_score'];
      final double duration = route['duration'] / 60;

      PolylinePoints polylinePoints = PolylinePoints();
      List<PointLatLng> decodedPoints =
          polylinePoints.decodePolyline(encodedPolyline);
      List<Position> routeGeometry =
          decodedPoints.map((p) => Position(p.longitude, p.latitude)).toList();

      _polylineManager?.create(PolylineAnnotationOptions(
        geometry: LineString(coordinates: routeGeometry),
        lineColor: Colors.blueAccent.value,
        lineWidth: 6.0,
        lineJoin: LineJoin.ROUND,
      ));

      _pointManager?.create(PointAnnotationOptions(
        geometry: Point(coordinates: Position(endLng, endLat)),
        iconImage: "marker-15",
        iconSize: 1.5,
      ));

      setState(() {
        _isRouteActive = true;
        _riskScore = 100 - safetyScore;
        _durationMin = duration;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Could not find a route!")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SlidingUpPanel(
        maxHeight: 450,
        minHeight: 150,
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
                center: Point(coordinates: Position(startLng, startLat)),
                zoom: 13.5,
              ),
              styleUri: MapboxStyles.MAPBOX_STREETS,
              onMapCreated: _onMapCreated,
              onTapListener: _handleMapTap,
            ),

            // --- ANIMATED SEARCH PANEL ---
            _buildAnimatedSearchPanel(),
          ],
        ),
      ),
      bottomNavigationBar: _buildNavBar(),
    );
  }

  // --- 3. ANIMATED DYNAMIC SEARCH BAR (UPDATED) ---
  Widget _buildAnimatedSearchPanel() {
    return Positioned(
      top: 55,
      left: 15,
      right: 15,
      child: GestureDetector(
        onTap: () {
          if (!_isInputExpanded) {
            setState(() => _isInputExpanded = true);
          }
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOutCubic,
          height: _isInputExpanded
              ? 160
              : 55, // Increased slightly to 160 to be safe
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
            // ✅ FIX: Wrap the child in SingleChildScrollView to prevent overflow errors during animation
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

  // Initial State: "Where to?"
  Widget _buildCollapsedInput() {
    return Row(
      key: const ValueKey("collapsed"),
      children: [
        const Icon(Icons.search, color: Color(0xFFFF4081), size: 24),
        const SizedBox(width: 15),
        Text("Where to?",
            style: GoogleFonts.poppins(
                color: Colors.black87,
                fontWeight: FontWeight.w600,
                fontSize: 15)),
        const Spacer(),
        Container(
          padding: const EdgeInsets.all(5),
          decoration:
              BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle),
          child: const Icon(Icons.access_time_filled,
              size: 18, color: Colors.grey),
        )
      ],
    );
  }

  // Expanded State: Uber Style Dual Inputs (UPDATED)
  Widget _buildExpandedInputs() {
    return Column(
      key: const ValueKey("expanded"),
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center, // Center content vertically
      children: [
        // Row 1: Start Location
        Row(
          children: [
            GestureDetector(
              onTap: () {
                setState(() => _isInputExpanded = false);
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

        // Row 2: Destination
        Row(
          children: [
            const SizedBox(width: 30),
            const Icon(Icons.location_on_rounded,
                color: Color(0xFFFF4081), size: 16),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: _destinationController,
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
            const Icon(Icons.add, size: 20, color: Colors.grey),
          ],
        ),
      ],
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
                    topRight: Radius.circular(24)),
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
                            letterSpacing: 1.2),
                      ),
                      Text(
                        "${_durationMin.toStringAsFixed(0)} mins • Risk: $_riskScore%",
                        style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold),
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
              title: Text("Route Details",
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
              subtitle: Text(
                  "This path avoids ${_riskScore > 0 ? 'detected high-crime zones' : 'all known danger zones'}.",
                  style: GoogleFonts.poppins(fontSize: 12)),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isRouteActive = false;
                    _isInputExpanded = false; // Collapse input on clear
                    _destinationController.clear();
                    _polylineManager?.deleteAll();
                    _pointManager?.deleteAll();
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black87,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: Text("Clear Route",
                    style: GoogleFonts.poppins(
                        color: Colors.white, fontWeight: FontWeight.w600)),
              ),
            )
          ],
        ),
      );
    }

    // Default Bottom Sheet Content (unchanged)
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            height: 90,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF2C3E50), Color(0xFF4CA1AF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24), topRight: Radius.circular(24)),
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
                        const Icon(Icons.shield_moon,
                            color: Colors.white, size: 18),
                        const SizedBox(width: 8),
                        Text("SENTRA ACTIVE",
                            style: GoogleFonts.poppins(
                                color: Colors.white70,
                                fontSize: 12,
                                letterSpacing: 1.5,
                                fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text("You are in a Safe Zone",
                        style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold)),
                  ],
                ),
                const Icon(Icons.battery_saver,
                    color: Colors.white70, size: 28),
              ],
            ),
          ),
          const SizedBox(height: 30),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildFeatureIcon(Icons.share_location_rounded, "Share Loc",
                    Colors.blue[50]!, Colors.blue),
                _buildFeatureIcon(Icons.local_police_rounded, "Police",
                    Colors.orange[50]!, Colors.orange),
                _buildFeatureIcon(Icons.report_problem_rounded, "Place Rating",
                    Colors.red[50]!, Colors.red),
              ],
            ),
          ),
          const SizedBox(height: 25),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 25),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Safe Havens Nearby",
                    style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87)),
                const SizedBox(height: 15),
                _buildSafePlaceTile("Katpadi Station", "0.5 km • Open 24x7"),
                _buildSafePlaceTile(
                    "VIT Main Gate", "1.2 km • Security Present"),
                const SizedBox(height: 20),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildFeatureIcon(
      IconData icon, String label, Color bg, Color iconColor) {
    return Column(
      children: [
        Container(
          height: 65,
          width: 65,
          decoration:
              BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
          child: Icon(icon, color: iconColor, size: 30),
        ),
        const SizedBox(height: 10),
        Text(label,
            style: GoogleFonts.poppins(
                fontWeight: FontWeight.w500,
                fontSize: 13,
                color: Colors.black87)),
      ],
    );
  }

  Widget _buildNavBar() {
    return Container(
      decoration: BoxDecoration(boxShadow: [
        BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, -5))
      ]),
      child: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 0,
        selectedItemColor: const Color(0xFFFF4081),
        unselectedItemColor: Colors.grey[400],
        showUnselectedLabels: true,
        selectedLabelStyle:
            GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600),
        unselectedLabelStyle: GoogleFonts.poppins(fontSize: 12),
        items: const [
          BottomNavigationBarItem(
              icon: Icon(Icons.home_rounded, size: 28), label: "Home"),
          BottomNavigationBarItem(
              icon: Icon(Icons.emergency_rounded, color: Colors.red, size: 36),
              label: "SOS"),
          BottomNavigationBarItem(
              icon: Icon(Icons.person_rounded, size: 28), label: "Profile"),
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
                offset: const Offset(0, 2))
          ]),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(10)),
            child:
                Icon(Icons.store_rounded, color: Colors.green[700], size: 22),
          ),
          const SizedBox(width: 15),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600, fontSize: 14)),
              const SizedBox(height: 2),
              Text(subtitle,
                  style: GoogleFonts.poppins(
                      fontSize: 12, color: Colors.grey[600])),
            ],
          ),
          const Spacer(),
          const Icon(Icons.directions_outlined, color: Colors.grey, size: 20),
        ],
      ),
    );
  }
}
