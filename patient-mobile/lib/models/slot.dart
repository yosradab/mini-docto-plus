class SlotModel {
  final String id;
  final String proId;
  final String date;
  final String startTime;
  final String endTime;
  final bool isBooked;

  SlotModel({
    required this.id,
    required this.proId,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.isBooked,
  });

  factory SlotModel.fromJson(Map<String, dynamic> json) {
    return SlotModel(
      id: json['id'] ?? json['_id'] ?? '',
      proId: json['pro'] ?? '',
      date: json['date'] ?? '',
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      isBooked: json['isBooked'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'pro': proId,
      'date': date,
      'startTime': startTime,
      'endTime': endTime,
      'isBooked': isBooked,
    };
  }
}
