import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/user.dart';
import '../models/slot.dart';

class BookingScreen extends StatefulWidget {
  final UserModel professional;
  final String? existingAppointmentId; // Présent si mode "Modification"
  final String? existingNotes;

  const BookingScreen({
    super.key,
    required this.professional,
    this.existingAppointmentId,
    this.existingNotes,
  });

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  late Future<List<SlotModel>> _slotsFuture;
  SlotModel? _selectedSlot;
  final _notesController = TextEditingController();
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _refreshSlots();
    if (widget.existingNotes != null) {
      _notesController.text = widget.existingNotes!;
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  void _refreshSlots() {
    setState(() {
      _slotsFuture = Provider.of<ApiService>(context, listen: false)
          .getProSlots(widget.professional.id);
    });
  }

  void _submitBooking() async {
    if (_selectedSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez sélectionner un créneau horaire.')),
      );
      return;
    }

    setState(() => _submitting = true);
    final apiService = Provider.of<ApiService>(context, listen: false);

    try {
      bool success;
      if (widget.existingAppointmentId != null) {
        // Mode Modification
        success = await apiService.updateAppointment(
          widget.existingAppointmentId!,
          _selectedSlot!.id,
          notes: _notesController.text.trim(),
        );
      } else {
        // Mode Nouvelle Réservation
        success = await apiService.bookAppointment(
          _selectedSlot!.id,
          notes: _notesController.text.trim(),
        );
      }

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.existingAppointmentId != null
                ? 'Rendez-vous modifié avec succès !'
                : 'Rendez-vous réservé avec succès !'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop(true); // Retour avec statut succès
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('EEEE d MMMM', 'fr_FR').format(date);
    } catch (e) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditMode = widget.existingAppointmentId != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditMode ? 'Modifier le rendez-vous' : 'Prendre rendez-vous'),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Pro details summary card
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: Colors.cyan.shade50,
                        child: const Icon(Icons.person, color: Colors.cyan),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.professional.name,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              widget.professional.specialty ?? 'Généraliste',
                              style: TextStyle(fontSize: 13, color: Colors.cyan.shade800),
                            ),
                          ],
                        ),
                      ),
                      Chip(
                        label: Text('${widget.professional.score}/100'),
                        backgroundColor: Colors.cyan.withOpacity(0.08),
                        labelStyle: const TextStyle(fontWeight: FontWeight.bold, color: Colors.cyan),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                '1. Sélectionnez un créneau horaire disponible',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.grey),
              ),
              const SizedBox(height: 12),
              // Availability slots loader
              FutureBuilder<List<SlotModel>>(
                future: _slotsFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20.0),
                        child: CircularProgressIndicator(color: Colors.cyan),
                      ),
                    );
                  } else if (snapshot.hasError) {
                    return Text('Erreur : ${snapshot.error}', style: const TextStyle(color: Colors.red));
                  }

                  final slots = snapshot.data ?? [];
                  if (slots.isEmpty) {
                    return Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'Aucun créneau de consultation disponible pour ce professionnel. Veuillez réessayer plus tard.',
                        style: TextStyle(color: Colors.grey),
                        textAlign: TextAlign.center,
                      ),
                    );
                  }

                  return GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 2.2,
                    ),
                    itemCount: slots.length,
                    itemBuilder: (context, index) {
                      final slot = slots[index];
                      final isSelected = _selectedSlot?.id == slot.id;

                      return InkWell(
                        onTap: () {
                          setState(() => _selectedSlot = slot);
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.cyan.shade700 : Colors.white,
                            border: Border.all(
                              color: isSelected ? Colors.cyan.shade800 : Colors.grey.shade300,
                              width: 1.5,
                            ),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: isSelected
                                ? [BoxShadow(color: Colors.cyan.withOpacity(0.3), blurRadius: 6)]
                                : [],
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _formatDate(slot.date),
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  color: isSelected ? Colors.white : Colors.black80,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '🕒 ${slot.startTime} - ${slot.endTime}',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : Colors.cyan.shade800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
              const SizedBox(height: 28),
              const Text(
                '2. Notes complémentaires (motif de consultation...)',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.grey),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _notesController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Ex: Consultation de suivi, ordonnance, douleurs dorsales...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Colors.cyan, width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 36),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _submitting ? null : _submitBooking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.cyan.shade700,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _submitting
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation(Colors.white),
                          ),
                        )
                      : Text(
                          isEditMode ? 'Confirmer la modification' : 'Réserver mon rendez-vous',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
