import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';
import '../models/slot.dart';
import '../models/appointment.dart';

class ApiService extends ChangeNotifier {
  static String get baseUrl => ApiConfig.baseUrl;

  String? _token;
  UserModel? _currentUser;
  bool _isLoading = false;
  bool _sessionLoaded = false;

  String? get token => _token;
  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get sessionLoaded => _sessionLoaded;
  bool get isAuthenticated => _token != null;

  ApiService() {
    _loadSession();
  }

  // Charger la session persistée au démarrage de l'app
  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    final userStr = prefs.getString('user');
    if (userStr != null) {
      _currentUser = UserModel.fromJson(jsonDecode(userStr));
    }
    _sessionLoaded = true;
    notifyListeners();
  }

  // Enregistrer le token et l'utilisateur
  Future<void> _saveSession(String token, UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('user', jsonEncode(user.toJson()));
    _token = token;
    _currentUser = user;
    notifyListeners();
  }

  // --- ACTIONS AUTHENTIFICATION ---

  Future<bool> register({
    required String name,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'role': 'patient',
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 && data['success'] == true) {
        final user = UserModel.fromJson(data['user']);
        await _saveSession(data['token'], user);
        return true;
      } else {
        throw Exception(data['message'] ?? 'Erreur d\'inscription');
      }
    } catch (e) {
      debugPrint('Register Error: $e');
      _throwConnectionError(e, 'inscription');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final user = UserModel.fromJson(data['user']);
        if (user.role != 'patient') {
          throw Exception('Cet espace mobile est réservé aux patients.');
        }
        await _saveSession(data['token'], user);
        return true;
      } else {
        throw Exception(data['message'] ?? 'Erreur de connexion');
      }
    } catch (e) {
      debugPrint('Login Error: $e');
      _throwConnectionError(e, 'connexion');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Never _throwConnectionError(Object e, String action) {
    final msg = e.toString().toLowerCase();
    if (msg.contains('connection refused') ||
        msg.contains('failed host lookup') ||
        msg.contains('network is unreachable') ||
        msg.contains('socketexception')) {
      throw Exception(
        'Serveur inaccessible ($action). Démarrez le backend sur le port 5000 '
        '(URL: $baseUrl).',
      );
    }
    throw e;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    _token = null;
    _currentUser = null;
    notifyListeners();
  }

  // --- ACTIONS PATIENT ---

  // Consulter la liste des professionnels triés par score décroissant
  Future<List<UserModel>> getProfessionals() async {
    if (_token == null) return [];

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/patients/pros'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final List prosJson = data['professionals'] ?? [];
        return prosJson.map((json) => UserModel.fromJson(json)).toList();
      } else {
        throw Exception(data['message'] ?? 'Erreur de récupération des professionnels');
      }
    } catch (e) {
      debugPrint('Get Professionals Error: $e');
      rethrow;
    }
  }

  // Récupérer les créneaux libres pour un professionnel
  Future<List<SlotModel>> getProSlots(String proId) async {
    if (_token == null) return [];

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/patients/pros/$proId/slots'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final List slotsJson = data['slots'] ?? [];
        return slotsJson.map((json) => SlotModel.fromJson(json)).toList();
      } else {
        throw Exception(data['message'] ?? 'Erreur de récupération des créneaux');
      }
    } catch (e) {
      debugPrint('Get Slots Error: $e');
      rethrow;
    }
  }

  // Réserver un créneau
  Future<bool> bookAppointment(String slotId, {String notes = ''}) async {
    if (_token == null) return false;

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/patients/appointments'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
        body: jsonEncode({
          'slotId': slotId,
          'notes': notes,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 && data['success'] == true) {
        return true;
      } else {
        throw Exception(data['message'] ?? 'Erreur de réservation');
      }
    } catch (e) {
      debugPrint('Book Appointment Error: $e');
      rethrow;
    }
  }

  // Consulter ses rendez-vous
  Future<List<AppointmentModel>> getPatientAppointments() async {
    if (_token == null) return [];

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/patients/appointments'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final List aptsJson = data['appointments'] ?? [];
        return aptsJson.map((json) => AppointmentModel.fromJson(json)).toList();
      } else {
        throw Exception(data['message'] ?? 'Erreur de récupération de vos rendez-vous');
      }
    } catch (e) {
      debugPrint('Get Appointments Error: $e');
      rethrow;
    }
  }

  // Modifier son rendez-vous (Changer de créneau horaire)
  Future<bool> updateAppointment(String appointmentId, String newSlotId, {String notes = ''}) async {
    if (_token == null) return false;

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/patients/appointments/$appointmentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
        body: jsonEncode({
          'newSlotId': newSlotId,
          'notes': notes,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return true;
      } else {
        throw Exception(data['message'] ?? 'Erreur de modification');
      }
    } catch (e) {
      debugPrint('Update Appointment Error: $e');
      rethrow;
    }
  }

  // Annuler son rendez-vous
  Future<bool> cancelAppointment(String appointmentId) async {
    if (_token == null) return false;

    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/patients/appointments/$appointmentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return true;
      } else {
        throw Exception(data['message'] ?? 'Erreur d\'annulation');
      }
    } catch (e) {
      debugPrint('Cancel Appointment Error: $e');
      rethrow;
    }
  }
}
