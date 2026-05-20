import 'user.dart';
import 'slot.dart';

class AppointmentModel {
  final String id;
  final String patientId;
  final UserModel pro;
  final SlotModel slot;
  final String notes;
  final String status;

  AppointmentModel({
    required this.id,
    required this.patientId,
    required this.pro,
    required this.slot,
    required this.notes,
    required this.status,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['id'] ?? json['_id'] ?? '',
      patientId: json['patient'] ?? '',
      pro: json['pro'] is Map<String, dynamic>
          ? UserModel.fromJson(json['pro'])
          : UserModel(id: json['pro'] ?? '', name: 'Dr. Chargement...', email: '', role: 'pro'),
      slot: json['slot'] is Map<String, dynamic>
          ? SlotModel.fromJson(json['slot'])
          : SlotModel(id: json['slot'] ?? '', proId: '', date: '', startTime: '', endTime: '', isBooked: true),
      notes: json['notes'] ?? '',
      status: json['status'] ?? 'confirmed',
    );
  }
}
