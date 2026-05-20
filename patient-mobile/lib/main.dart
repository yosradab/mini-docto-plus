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
    final apiService = Provider.of<ApiService>(context);

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
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black80,
          elevation: 0,
          border: Border(
            bottom: BorderSide(color: Colors.grey.shade200, width: 1),
          ),
        ),
        cardTheme: const CardTheme(
          color: Colors.white,
          surfaceTintColor: Colors.transparent,
        ),
      ),
      // Renvoyer vers la liste des professionnels si authentifié, sinon vers le login
      home: apiService.isAuthenticated 
          ? const ProfessionalListScreen() 
          : const LoginScreen(),
    );
  }
}
