import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  // Auth states
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Form states (Auth)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('Médecin Généraliste');
  const [bio, setBio] = useState('');
  const [score, setScore] = useState(85);

  // Dashboard states
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // New Slot form states
  const [slotDate, setSlotDate] = useState('');
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');

  // Auto-clear alert after 4 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Fetch Slots and Appointments when token is active
  useEffect(() => {
    if (token && user && user.role === 'pro') {
      fetchProSlots();
      fetchProAppointments();
    }
  }, [token, user]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
  };

  // --- API OPERATIONS ---

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de la connexion');

      if (data.user.role !== 'pro') {
        throw new Error('Cet espace est réservé uniquement aux professionnels de santé.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      showAlert(`Bienvenue, Dr. ${data.user.name} !`, 'success');
      
      // Reset credentials
      setEmail('');
      setPassword('');
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role: 'pro',
        specialty,
        bio,
        score: Number(score)
      };

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de l\'inscription');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      showAlert(`Compte professionnel créé avec succès ! Bienvenue, Dr. ${data.user.name}`, 'success');

      // Clear forms
      setName('');
      setEmail('');
      setPassword('');
      setBio('');
      setIsRegistering(false);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setSlots([]);
    setAppointments([]);
    showAlert('Vous avez été déconnecté avec succès.', 'success');
  };

  const fetchProSlots = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/pros/slots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSlots(data.slots);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des créneaux:', err);
    }
  };

  const fetchProAppointments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/pros/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des rendez-vous:', err);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!slotDate || !slotStart || !slotEnd) {
      showAlert('Veuillez remplir tous les champs du créneau.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/pros/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: slotDate,
          startTime: slotStart,
          endTime: slotEnd
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de la création du créneau');

      showAlert('Disponibilité ajoutée avec succès !', 'success');
      setSlotDate('');
      setSlotStart('');
      setSlotEnd('');
      fetchProSlots(); // Recharger les créneaux
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette disponibilité ?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/pros/slots/${slotId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de la suppression');

      showAlert('Disponibilité supprimée.', 'success');
      fetchProSlots(); // Recharger les créneaux
      fetchProAppointments(); // Recharger les rendez-vous si jamais un changement a eu lieu
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  // --- VIEWS ---

  if (!token) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-logo">Mini Docto+</h1>
            <p className="auth-subtitle">Espace Professionnels de Santé</p>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type}`}>
              {alert.type === 'success' ? '✅' : '❌'} {alert.message}
            </div>
          )}

          {isRegistering ? (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Dr. Jean Martin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adresse email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="nom@doctoplus.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Spécialité</label>
                  <select
                    className="form-select"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  >
                    <option>Médecin Généraliste</option>
                    <option>Pédiatre</option>
                    <option>Cardiologue</option>
                    <option>Dentiste</option>
                    <option>Ophtalmologue</option>
                    <option>Dermatologue</option>
                    <option>Psychologue</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Score (Réputation 0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-input"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Biographie / Description</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Présentez vos diplômes et expertises..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <div className="loading-spinner"></div> : 'Créer mon compte professionnel'}
              </button>

              <div className="auth-footer">
                Déjà inscrit ?{' '}
                <a href="#" className="auth-link" onClick={() => setIsRegistering(false)}>
                  Se connecter
                </a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email professionnel</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="medecin@doctoplus.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <div className="loading-spinner"></div> : 'Se connecter'}
              </button>

              <div className="auth-footer">
                Nouveau professionnel ?{' '}
                <a href="#" className="auth-link" onClick={() => setIsRegistering(true)}>
                  Créer un compte
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Dashboard Page
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-text">Mini Docto+</span>
          <span className="brand-badge">Espace Pro</span>
        </div>
        <div className="nav-user">
          <div className="user-info-chip">
            <div className="user-avatar">{user.name.charAt(0) || 'D'}</div>
            <span className="user-name">Dr. {user.name}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.type === 'success' ? '✅' : '❌'} {alert.message}
          </div>
        )}

        {/* Hero Doctor Summary */}
        <section className="pro-hero">
          <div className="pro-hero-details">
            <div className="pro-big-avatar">🩺</div>
            <div className="pro-info-text">
              <h2>Dr. {user.name}</h2>
              <div>
                <span className="pro-specialty-badge">{user.specialty}</span>
                <span className="pro-score-pill">Note de pertinence : {user.score}/100</span>
              </div>
              <p className="pro-bio">{user.bio || "Aucune biographie rédigée. Ajoutez des détails lors de l'inscription pour attirer plus de patients."}</p>
            </div>
          </div>
          <div className="score-widget">
            <div className="score-value">{user.score}</div>
            <div className="score-label">Score Global</div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Manage Slots */}
          <div className="section-card">
            <div className="section-title">
              <div>
                <span>Mes Disponibilités</span>
                <p className="section-subtitle">Ajoutez ou supprimez vos créneaux de consultation</p>
              </div>
            </div>

            {/* Add Slot Form */}
            <form onSubmit={handleAddSlot} className="slot-form">
              <div className="form-group">
                <label className="form-label">Date du créneau</label>
                <input
                  type="date"
                  className="form-input"
                  value={slotDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSlotDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Heure de début</label>
                  <input
                    type="time"
                    className="form-input"
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Heure de fin</label>
                  <input
                    type="time"
                    className="form-input"
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                ➕ Ajouter ce créneau
              </button>
            </form>

            {/* Slots List */}
            <div className="slots-container">
              {slots.length === 0 ? (
                <div className="empty-state">Aucun créneau de disponibilité configuré pour le moment.</div>
              ) : (
                slots.map((slot) => (
                  <div className="slot-item" key={slot._id}>
                    <div className="slot-info">
                      <span className="slot-date">
                        {new Date(slot.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="slot-time">
                        🕒 {slot.startTime} - {slot.endTime}
                      </span>
                      <span className={`slot-badge ${slot.isBooked ? 'slot-badge-booked' : 'slot-badge-available'}`}>
                        {slot.isBooked ? 'Réservé' : 'Libre'}
                      </span>
                    </div>
                    <button
                      className="btn-delete-slot"
                      onClick={() => handleDeleteSlot(slot._id)}
                      title="Supprimer la disponibilité"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Appointments */}
          <div className="section-card">
            <div className="section-title">
              <div>
                <span>Rendez-vous Patients</span>
                <p className="section-subtitle">Consultez les rendez-vous réservés par vos patients</p>
              </div>
            </div>

            <div className="appointments-container">
              {appointments.length === 0 ? (
                <div className="empty-state">Aucun rendez-vous réservé pour le moment. Vos créneaux disponibles apparaissent sur l'application patient.</div>
              ) : (
                appointments.map((apt) => (
                  <div className="appointment-card" key={apt._id}>
                    <div className="apt-header">
                      <div className="apt-date-time">
                        <span className="apt-date">
                          {new Date(apt.slot.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="apt-time">
                          🕒 {apt.slot.startTime} - {apt.slot.endTime}
                        </span>
                      </div>
                      <span className="apt-status">Confirmé</span>
                    </div>
                    <div className="apt-body">
                      <div className="patient-info">
                        <span className="patient-name">Patient : {apt.patient.name}</span>
                        <span className="patient-email">📧 {apt.patient.email}</span>
                      </div>
                      {apt.notes && (
                        <div className="apt-notes">
                          <strong>Notes du patient :</strong> "{apt.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
