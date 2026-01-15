import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sliding_up_panel/sliding_up_panel.dart';
import 'package:google_fonts/google_fonts.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  MapboxMap? mapboxMap;
  
  // VIT Vellore Coordinates (Your Hackathon Location)
  final double lat = 12.9692;
  final double lng = 79.1559;

  @override
  void initState() {
    super.initState();
    // This triggers the permission dialogs on app start
    _requestPermissions();
  }

  Future<void> _requestPermissions() async {
    // Requesting Location and Microphone permissions
    await [
      Permission.location,
      Permission.microphone, 
    ].request();
  }

  _onMapCreated(MapboxMap mapboxMap) {
    this.mapboxMap = mapboxMap;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Sliding Panel
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
            // 1. The Map Layer 
            MapWidget(
              key: const ValueKey("mapWidget"),
              cameraOptions: CameraOptions(
                center: Point(coordinates: Position(lng, lat)),
                zoom: 15.0,
              ),
              styleUri: MapboxStyles.MAPBOX_STREETS, 
              onMapCreated: _onMapCreated,
            ),
            
            // 2. "SafeNav" Search Bar with Depth
            Positioned(
              top: 60,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 15),
                height: 55,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18), 
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.12),
                      blurRadius: 20, 
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    const Icon(Icons.my_location, color: Color(0xFFFF4081)),
                    const SizedBox(width: 15),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Enter Destination",
                          style: GoogleFonts.poppins(
                            color: Colors.black87,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        Text(
                          "We'll find the safest route...",
                          style: GoogleFonts.poppins(
                            color: Colors.grey[500],
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                             color: Colors.black.withOpacity(0.05),
                             blurRadius: 5,
                             offset: const Offset(0, 2),
                          )
                        ]
                      ),
                      child: const Icon(Icons.mic, color: Colors.grey),
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      
      // 3. SENTRA Navigation Bar
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, -5),
            )
          ]
        ),
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          elevation: 0, 
          selectedItemColor: const Color(0xFFFF4081),
          unselectedItemColor: Colors.grey[400],
          showUnselectedLabels: true,
          selectedLabelStyle: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600),
          unselectedLabelStyle: GoogleFonts.poppins(fontSize: 12),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_rounded, size: 28), 
              label: "Home"
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.emergency_rounded, color: Colors.red, size: 36), 
              label: "SOS"
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_rounded, size: 28), 
              label: "Profile"
            ),
          ],
        ),
      ),
    );
  }

  // The Content inside the Sliding Panel
  Widget _buildBottomSheet() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        children: [
          // Gradient Banner
          Container(
            width: double.infinity,
            height: 90,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2C3E50), Color(0xFF4CA1AF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2C3E50).withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
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
                        const Icon(Icons.shield_moon, color: Colors.white, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          "SENTRA ACTIVE",
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
                      "You are in a Safe Zone",
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Icon(Icons.battery_saver, color: Colors.white70, size: 28),
              ],
            ),
          ),
          
          const SizedBox(height: 30),
          
          // Quick Actions
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround, 
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildFeatureIcon(Icons.share_location_rounded, "Share Loc", Colors.blue[50]!, Colors.blue),
                _buildFeatureIcon(Icons.local_police_rounded, "Police", Colors.orange[50]!, Colors.orange),
                _buildFeatureIcon(Icons.report_problem_rounded, "Report", Colors.red[50]!, Colors.red),
              ],
            ),
          ),

          const SizedBox(height: 25),

          // Safe Havens
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
                    color: Colors.black87
                  ),
                ),
                const SizedBox(height: 15),
                _buildSafePlaceTile("Katpadi Station", "0.5 km • Open 24x7"),
                _buildSafePlaceTile("VIT Main Gate", "1.2 km • Security Present"),
                const SizedBox(height: 20), 
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildFeatureIcon(IconData icon, String label, Color bg, Color iconColor) {
    return Column(
      children: [
        Container(
          height: 65,
          width: 65,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: iconColor.withOpacity(0.25),
                blurRadius: 12,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Icon(icon, color: iconColor, size: 30),
        ),
        const SizedBox(height: 10),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w500, 
            fontSize: 13,
            color: Colors.black87
          ),
        ),
      ],
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
          )
        ]
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(10)
            ),
            child: Icon(Icons.store_rounded, color: Colors.green[700], size: 22),
          ),
          const SizedBox(width: 15),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
              const SizedBox(height: 2),
              Text(subtitle, style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600])),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.all(8),
             decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(8)
            ),
            child: Icon(Icons.directions_outlined, color: Colors.grey[400], size: 20)
          ),
        ],
      ),
    );
  }
}