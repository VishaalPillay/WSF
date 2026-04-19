import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Tokens from DESIGN.md (Uber-inspired monochrome).
abstract final class SentraDesign {
  static const Color uberBlack = Color(0xFF000000);
  static const Color pureWhite = Color(0xFFFFFFFF);
  static const Color bodyGray = Color(0xFF4B4B4B);
  static const Color mutedGray = Color(0xFFAFAFAF);
  static const Color chipGray = Color(0xFFEFEFEF);
  static const Color hoverGray = Color(0xFFE2E2E2);
  static const Color hoverLight = Color(0xFFF3F3F3);

  /// Standard card whisper shadow.
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.12),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];

  /// Floating / slightly stronger.
  static List<BoxShadow> elevatedShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.16),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  static TextStyle displayHeadline({double fontSize = 28}) =>
      GoogleFonts.inter(
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        height: 1.22,
        color: uberBlack,
      );

  static TextStyle sectionHeading({double fontSize = 20}) =>
      GoogleFonts.inter(
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        height: 1.25,
        color: uberBlack,
      );

  static TextStyle body({Color? color, FontWeight weight = FontWeight.w400}) =>
      GoogleFonts.inter(
        fontSize: 16,
        fontWeight: weight,
        height: 1.4,
        color: color ?? bodyGray,
      );

  static TextStyle caption({Color? color}) => GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        height: 1.35,
        color: color ?? bodyGray,
      );

  static TextStyle micro({Color? color}) => GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: color ?? mutedGray,
      );

  static ThemeData buildTheme() {
    const outline = OutlineInputBorder(
      borderRadius: BorderRadius.all(Radius.circular(8)),
      borderSide: BorderSide(color: uberBlack, width: 1),
    );
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: pureWhite,
      colorScheme: const ColorScheme.light(
        primary: uberBlack,
        onPrimary: pureWhite,
        surface: pureWhite,
        onSurface: uberBlack,
        secondary: bodyGray,
        onSecondary: pureWhite,
        error: uberBlack,
        onError: pureWhite,
      ),
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: pureWhite,
        foregroundColor: uberBlack,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w500,
          color: uberBlack,
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: uberBlack,
        contentTextStyle: GoogleFonts.inter(
          color: pureWhite,
          fontWeight: FontWeight.w500,
          fontSize: 14,
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: uberBlack,
          foregroundColor: pureWhite,
          minimumSize: const Size(0, 44),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          shape: const StadiumBorder(),
          elevation: 0,
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: uberBlack,
          minimumSize: const Size(0, 44),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          side: const BorderSide(color: uberBlack, width: 1),
          shape: const StadiumBorder(),
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: pureWhite,
        hintStyle: GoogleFonts.inter(color: mutedGray, fontSize: 16),
        labelStyle: GoogleFonts.inter(color: bodyGray, fontSize: 14),
        border: outline,
        enabledBorder: outline,
        focusedBorder: outline,
        errorBorder: outline.copyWith(
          borderSide: const BorderSide(color: uberBlack, width: 1),
        ),
        focusedErrorBorder: outline,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.inter(
          fontSize: 32,
          fontWeight: FontWeight.w700,
          color: uberBlack,
        ),
        titleLarge: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: uberBlack,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: bodyGray,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: bodyGray,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: uberBlack,
        ),
      ),
    );
  }
}
