import 'package:flutter/foundation.dart';

/// Resolves the Spring Boot API base URL for the current platform.
///
/// Override host for a physical device: `flutter run --dart-define=API_HOST=192.168.1.10`
class ApiConfig {
  static const String _port = '5000';
  static const String _path = '/api';

  static String? get _hostOverride {
    const host = String.fromEnvironment('API_HOST');
    return host.isEmpty ? null : host;
  }

  static String get baseUrl {
    if (_hostOverride != null) {
      return 'http://${_hostOverride!}:$_port$_path';
    }
    if (kIsWeb) {
      return 'http://localhost:$_port$_path';
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        // Android emulator: host machine localhost
        return 'http://10.0.2.2:$_port$_path';
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
        return 'http://localhost:$_port$_path';
      default:
        return 'http://localhost:$_port$_path';
    }
  }
}
