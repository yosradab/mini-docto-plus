class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? specialty;
  final String? bio;
  final int? score;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.specialty,
    this.bio,
    this.score,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'patient',
      specialty: json['specialty'],
      bio: json['bio'],
      score: json['score'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'specialty': specialty,
      'bio': bio,
      'score': score,
    };
  }
}
