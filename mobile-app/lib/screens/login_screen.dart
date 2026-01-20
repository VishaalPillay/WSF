import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  // Toggle between Login and Register
  bool _isRegistering = false;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  // --- COLOR PALETTE ---
  final Color _primaryTeal = const Color.fromARGB(255, 10, 135, 152);
  final Color _lightPlatinum = const Color.fromARGB(255, 255, 246, 209);

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    if (_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isRegistering ? "Creating Account..." : "Logging in..."),
          backgroundColor: _primaryTeal,
          duration: const Duration(seconds: 1),
        ),
      );

      // Navigate to Home after delay
      Future.delayed(const Duration(seconds: 1), () {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const HomeScreen()),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // 1. GRADIENT BACKGROUND
          Container(
            height: double.infinity,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  _primaryTeal,     // #2C666E
                  Colors.blueGrey.shade700, 
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),

          // 2. DECORATIVE CIRCLES
          Positioned(
            top: -50,
            left: -50,
            child: Container(
              height: 200,
              width: 200,
              decoration: BoxDecoration(
                color: _lightPlatinum.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: 100,
            right: -30,
            child: Container(
              height: 150,
              width: 150,
              decoration: BoxDecoration(
                color: _lightPlatinum.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
            ),
          ),

          // 3. MAIN CONTENT
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // LOGO & TITLE
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: _lightPlatinum,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.15),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          )
                        ],
                      ),
                      child: Icon(
                        Icons.shield_moon_rounded,
                        size: 50,
                        color: _primaryTeal,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      "SENTRA",
                      style: GoogleFonts.poppins(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: _lightPlatinum,
                        letterSpacing: 2,
                      ),
                    ),
                    Text(
                      "Your Safety, Our Priority",
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        color: _lightPlatinum.withOpacity(0.9),
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 40),

                    // GLASS/WHITE CARD FORM
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(30),
                      decoration: BoxDecoration(
                        color: _lightPlatinum, 
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 30,
                            offset: const Offset(0, 15),
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isRegistering ? "Create Account" : "Welcome Back",
                              style: GoogleFonts.poppins(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: _primaryTeal,
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              _isRegistering
                                  ? "Sign up to start your journey."
                                  : "Please login to continue.",
                              style: GoogleFonts.poppins(
                                fontSize: 14,
                                color: Colors.grey[700],
                              ),
                            ),
                            const SizedBox(height: 30),

                            // FORM FIELDS
                            if (_isRegistering) ...[
                              _buildTextField(
                                controller: _nameController,
                                label: "Full Name",
                                icon: Icons.person_outline_rounded,
                                validator: (val) => val!.isEmpty ? "Name is required" : null,
                              ),
                              const SizedBox(height: 20),
                            ],

                            _buildTextField(
                              controller: _phoneController,
                              label: "Mobile Number",
                              icon: Icons.phone_android_rounded,
                              inputType: TextInputType.phone,
                              validator: (val) => val!.length < 10 ? "Invalid number" : null,
                            ),

                            const SizedBox(height: 30),

                            // ACTION BUTTON
                            SizedBox(
                              width: double.infinity,
                              height: 55,
                              child: ElevatedButton(
                                onPressed: _handleSubmit,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _primaryTeal,
                                  foregroundColor: _lightPlatinum,
                                  elevation: 5,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                                child: Text(
                                  _isRegistering ? "Register" : "Login",
                                  style: GoogleFonts.poppins(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 25),

                    // TOGGLE LOGIN / REGISTER
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _isRegistering = !_isRegistering;
                          if (!_isRegistering) _nameController.clear();
                        });
                      },
                      child: RichText(
                        text: TextSpan(
                          text: _isRegistering
                              ? "Already have an account? "
                              : "New User? ",
                          style: GoogleFonts.poppins(
                            color: _lightPlatinum.withOpacity(0.9),
                            fontSize: 15,
                          ),
                          children: [
                            TextSpan(
                              text: _isRegistering ? "Login" : "Register First",
                              style: GoogleFonts.poppins(
                                color: _lightPlatinum,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType inputType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: inputType,
      validator: validator,
      style: GoogleFonts.poppins(fontSize: 15, color: _primaryTeal),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(color: Colors.grey[600], fontSize: 14),
        prefixIcon: Icon(icon, color: _primaryTeal.withOpacity(0.7)),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: _primaryTeal, width: 1.5),
        ),
      ),
    );
  }
}