import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/professional_list_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialiser les formats de dates français
  await initializeDateFormatting('fr_FR', null);
  
  runApp(
    ChangeNotifierProvider(
      create: (_) => ApiService(),
      child: const MiniDoctoApp(),
    ),
  );
}

class MiniDoctoApp extends StatelessWidget {
  const MiniDoctoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ApiService>(
      builder: (context, apiService, _) {
        return MaterialApp(
          title: 'Mini Docto+',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            useMaterial3: true,
            fontFamily: 'Roboto',
            colorScheme: ColorScheme.fromSeed(
              seedColor: Colors.cyan,
              brightness: Brightness.light,
              primary: Colors.cyan.shade800,
              secondary: Colors.cyanAccent.shade700,
            ),
            appBarTheme: const AppBarTheme(
              backgroundColor: Colors.white,
              foregroundColor: Colors.black87,
              elevation: 0,
            ),
            cardTheme: const CardThemeData(
              color: Colors.white,
              surfaceTintColor: Colors.transparent,
            ),
          ),
          home: !apiService.sessionLoaded
              ? const Scaffold(
                  body: Center(child: CircularProgressIndicator()),
                )
              : apiService.isAuthenticated
                  ? const ProfessionalListScreen()
                  : const LoginScreen(),
        );
      },
    );
  }
}
