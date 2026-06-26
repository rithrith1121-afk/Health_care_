// LocalStorage database utilities and seed data

export const DB_KEYS = {
  USERS: 'users',
  LOGGED_IN_USER: 'loggedInUser',
  DOCTORS: 'doctors',
  DEPARTMENTS: 'departments',
  SCHEDULES: 'schedules',
  APPOINTMENTS: 'appointments',
};

// Simple Base64 encoding/decoding helpers for password obfuscation
export const encodePassword = (password) => {
  try {
    return btoa(password);
  } catch (e) {
    return password;
  }
};

export const decodePassword = (encoded) => {
  try {
    return atob(encoded);
  } catch (e) {
    return encoded;
  }
};


// Generic storage getters and setters
export const getDB = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

export const setDB = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

export const getLoggedInUser = () => {
  try {
    const data = localStorage.getItem(DB_KEYS.LOGGED_IN_USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error reading loggedInUser:", error);
    return null;
  }
};

export const setLoggedInUser = (user) => {
  if (user) {
    localStorage.setItem(DB_KEYS.LOGGED_IN_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(DB_KEYS.LOGGED_IN_USER);
  }
};

export const DEFAULT_DOCTORS = [
  // 1. General Medicine (4 doctors)
  {
    doctorId: "doc001",
    doctorName: "Dr. Ravi Kumar",
    email: "ravi@hospital.com",
    phone: "111-222-3333",
    department: "General Medicine",
    specialization: "Family Medicine",
    qualification: "MBBS, MD",
    experience: "12",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTime: "09:00 AM - 01:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch001", startTime: "09:00", endTime: "13:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_gen_sarah",
    doctorName: "Dr. Sarah Jenkins",
    email: "sarah.j@hospital.com",
    phone: "555-0201",
    department: "General Medicine",
    specialization: "Internal Medicine",
    qualification: "MD",
    experience: "10",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: "10:00 AM - 02:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_gen_sarah", startTime: "10:00", endTime: "14:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_gen_mark",
    doctorName: "Dr. Mark Adams",
    email: "mark.a@hospital.com",
    phone: "555-0202",
    department: "General Medicine",
    specialization: "General Physician",
    qualification: "MBBS, MD",
    experience: "15",
    availableDays: ["Tuesday", "Thursday"],
    availableTime: "02:00 PM - 06:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_gen_mark", startTime: "14:00", endTime: "18:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_gen_lisa",
    doctorName: "Dr. Lisa Cooper",
    email: "lisa.c@hospital.com",
    phone: "555-0203",
    department: "General Medicine",
    specialization: "Primary Care Specialist",
    qualification: "MBBS",
    experience: "8",
    availableDays: ["Monday", "Tuesday", "Thursday"],
    availableTime: "09:00 AM - 01:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-162290204747a-757c9823b485?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_gen_lisa", startTime: "09:00", endTime: "13:00", slotDuration: 30 }
  },

  // 2. Cardiology (4 doctors)
  {
    doctorId: "doc003",
    doctorName: "Dr. Arun Raj",
    email: "arun@hospital.com",
    phone: "333-444-5555",
    department: "Cardiology",
    specialization: "Interventional Cardiology",
    qualification: "MBBS, MD, DM",
    experience: "15",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTime: "04:00 PM - 08:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch003", startTime: "16:00", endTime: "20:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_card_elena",
    doctorName: "Dr. Elena Rostova",
    email: "elena.r@hospital.com",
    phone: "555-0204",
    department: "Cardiology",
    specialization: "Heart Failure Specialist",
    qualification: "MD, FACC",
    experience: "18",
    availableDays: ["Monday", "Wednesday"],
    availableTime: "09:00 AM - 01:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_card_elena", startTime: "09:00", endTime: "13:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_card_james",
    doctorName: "Dr. James Carter",
    email: "james.c@hospital.com",
    phone: "555-0205",
    department: "Cardiology",
    specialization: "Cardiovascular Disease",
    qualification: "MD",
    experience: "12",
    availableDays: ["Tuesday", "Thursday"],
    availableTime: "01:00 PM - 05:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1623854767648-e7bb8c690e1e?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_card_james", startTime: "13:00", endTime: "17:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_card_anita",
    doctorName: "Dr. Anita Desai",
    email: "anita.d@hospital.com",
    phone: "555-0206",
    department: "Cardiology",
    specialization: "Pediatric Cardiology",
    qualification: "MD, DNB",
    experience: "14",
    availableDays: ["Wednesday", "Friday"],
    availableTime: "02:00 PM - 06:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1622902048128-40bcfec4668b?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_card_anita", startTime: "14:00", endTime: "18:00", slotDuration: 30 }
  },

  // 3. Dental (3 doctors)
  {
    doctorId: "doc002",
    doctorName: "Dr. Priya Sharma",
    email: "priya@hospital.com",
    phone: "222-333-4444",
    department: "Dental",
    specialization: "Orthodontics",
    qualification: "BDS, MDS",
    experience: "8",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: "10:00 AM - 02:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch002", startTime: "10:00", endTime: "14:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_dent_david",
    doctorName: "Dr. David Miller",
    email: "david.m@hospital.com",
    phone: "555-0207",
    department: "Dental",
    specialization: "Periodontist",
    qualification: "DDS",
    experience: "11",
    availableDays: ["Tuesday", "Thursday", "Friday"],
    availableTime: "10:00 AM - 02:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_dent_david", startTime: "10:00", endTime: "14:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_dent_rachel",
    doctorName: "Dr. Rachel Green",
    email: "rachel.g@hospital.com",
    phone: "555-0208",
    department: "Dental",
    specialization: "Endodontist",
    qualification: "BDS, MDS",
    experience: "9",
    availableDays: ["Monday", "Wednesday"],
    availableTime: "01:00 PM - 05:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1625498542602-6be084199bef?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_dent_rachel", startTime: "13:00", endTime: "17:00", slotDuration: 30 }
  },

  // 4. Orthopedic (3 doctors)
  {
    doctorId: "doc_ortho_vijay",
    doctorName: "Dr. Vijay Patel",
    email: "vijay.p@hospital.com",
    phone: "555-0209",
    department: "Orthopedic",
    specialization: "Joint Replacement Specialist",
    qualification: "MS (Ortho)",
    experience: "16",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: "09:00 AM - 01:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_ortho_vijay", startTime: "09:00", endTime: "13:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_ortho_susan",
    doctorName: "Dr. Susan Vance",
    email: "susan.v@hospital.com",
    phone: "555-0210",
    department: "Orthopedic",
    specialization: "Sports Medicine Specialist",
    qualification: "MD",
    experience: "11",
    availableDays: ["Tuesday", "Thursday"],
    availableTime: "11:00 AM - 03:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_ortho_susan", startTime: "11:00", endTime: "15:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_ortho_robert",
    doctorName: "Dr. Robert Chen",
    email: "robert.c@hospital.com",
    phone: "555-0211",
    department: "Orthopedic",
    specialization: "Spine Surgeon",
    qualification: "MBBS, MS",
    experience: "20",
    availableDays: ["Monday", "Thursday"],
    availableTime: "04:00 PM - 08:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_ortho_robert", startTime: "16:00", endTime: "20:00", slotDuration: 30 }
  },

  // 5. Pediatrics (3 doctors)
  {
    doctorId: "doc004",
    doctorName: "Dr. Meena Thomas",
    email: "meena@hospital.com",
    phone: "444-555-6666",
    department: "Pediatrics",
    specialization: "Child Health",
    qualification: "MBBS, DCH, MD",
    experience: "10",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    availableTime: "11:00 AM - 03:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch004", startTime: "11:00", endTime: "15:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_ped_kevin",
    doctorName: "Dr. Kevin Parker",
    email: "kevin.p@hospital.com",
    phone: "555-0212",
    department: "Pediatrics",
    specialization: "General Pediatrics",
    qualification: "MD, FAAP",
    experience: "13",
    availableDays: ["Tuesday", "Thursday", "Friday"],
    availableTime: "09:00 AM - 01:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_ped_kevin", startTime: "09:00", endTime: "13:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_ped_clara",
    doctorName: "Dr. Clara Oswald",
    email: "clara.o@hospital.com",
    phone: "555-0213",
    department: "Pediatrics",
    specialization: "Neonatology",
    qualification: "MBBS, MD",
    experience: "7",
    availableDays: ["Monday", "Wednesday"],
    availableTime: "11:00 AM - 03:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_ped_clara", startTime: "11:00", endTime: "15:00", slotDuration: 30 }
  },

  // 6. ENT (3 doctors)
  {
    doctorId: "doc_ent_thomas",
    doctorName: "Dr. Thomas Shelby",
    email: "thomas.s@hospital.com",
    phone: "555-0214",
    department: "ENT",
    specialization: "Otolaryngologist",
    qualification: "MS (ENT)",
    experience: "14",
    availableDays: ["Monday", "Tuesday", "Wednesday"],
    availableTime: "10:00 AM - 02:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_ent_thomas", startTime: "10:00", endTime: "14:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_ent_arthur",
    doctorName: "Dr. Arthur Dent",
    email: "arthur.d@hospital.com",
    phone: "555-0215",
    department: "ENT",
    specialization: "Rhinologist",
    qualification: "MBBS, MS",
    experience: "10",
    availableDays: ["Thursday", "Friday"],
    availableTime: "01:00 PM - 05:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1623854767648-e7bb8c690e1e?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_ent_arthur", startTime: "13:00", endTime: "17:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_ent_donna",
    doctorName: "Dr. Donna Noble",
    email: "donna.n@hospital.com",
    phone: "555-0216",
    department: "ENT",
    specialization: "Audiologist Specialist",
    qualification: "MS",
    experience: "12",
    availableDays: ["Tuesday", "Thursday"],
    availableTime: "09:00 AM - 01:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-162290204747a-757c9823b485?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_ent_donna", startTime: "09:00", endTime: "13:00", slotDuration: 30 }
  },

  // 7. Dermatology (3 doctors)
  {
    doctorId: "doc_derm_jessica",
    doctorName: "Dr. Jessica Jones",
    email: "jessica.j@hospital.com",
    phone: "555-0217",
    department: "Dermatology",
    specialization: "Cosmetic Dermatology",
    qualification: "MD",
    experience: "12",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: "02:00 PM - 06:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_derm_jessica", startTime: "14:00", endTime: "18:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_derm_bruce",
    doctorName: "Dr. Bruce Banner",
    email: "bruce.b@hospital.com",
    phone: "555-0218",
    department: "Dermatology",
    specialization: "Medical Dermatology",
    qualification: "MD, PhD",
    experience: "15",
    availableDays: ["Tuesday", "Thursday"],
    availableTime: "09:00 AM - 01:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_derm_bruce", startTime: "09:00", endTime: "13:00", slotDuration: 30 }
  },
  {
    doctorId: "doc_derm_selina",
    doctorName: "Dr. Selina Kyle",
    email: "selina.k@hospital.com",
    phone: "555-0219",
    department: "Dermatology",
    specialization: "Trichologist Specialist",
    qualification: "MBBS, DDVL",
    experience: "9",
    availableDays: ["Wednesday", "Friday"],
    availableTime: "11:00 AM - 03:00 PM",
    status: "Available",
    avatarUrl: "https://images.unsplash.com/photo-1622902048128-40bcfec4668b?auto=format&fit=crop&q=80&w=250&h=250",
    schedule: { scheduleId: "sch_derm_selina", startTime: "11:00", endTime: "15:00", slotDuration: 30 }
  }
];

// Seed database with sample data if empty or partially empty
export const seedDatabase = () => {
  // 1. Seed Users (Admin, Patient templates)
  let users = getDB(DB_KEYS.USERS);

  // Upgrader self-healing: Ensure all existing users have obfuscated passwords
  let isUsersObfuscated = false;
  if (users && users.length > 0) {
    users = users.map(u => {
      try {
        const decoded = atob(u.password);
        if (btoa(decoded) === u.password) {
          return u; // Already encoded
        }
      } catch (e) {
        // Not base64
      }
      isUsersObfuscated = true;
      return { ...u, password: encodePassword(u.password) };
    });
    if (isUsersObfuscated) {
      setDB(DB_KEYS.USERS, users);
    }
  }

  if (!users || users.length === 0) {
    users = [
      {
        id: "admin001",
        name: "Dr. Smith",
        email: "admin@hospital.com",
        role: "admin",
        password: encodePassword("admin123"),
        phone: "555-0199",
      },
      // Sample Patients
      {
        id: "pat001",
        name: "Alex Johnson",
        email: "alex@patient.com",
        role: "patient",
        password: encodePassword("patient123"),
        phone: "123-456-7890",
        gender: "Male",
        dob: "1990-01-15",
      },
      {
        id: "pat002",
        name: "Jane Doe",
        email: "jane@patient.com",
        role: "patient",
        password: encodePassword("patient123"),
        phone: "987-654-3210",
        gender: "Female",
        dob: "1992-05-20",
      },
      {
        id: "pat003",
        name: "Michael Scott",
        email: "michael@patient.com",
        role: "patient",
        password: encodePassword("patient123"),
        phone: "555-555-5555",
        gender: "Male",
        dob: "1980-03-15",
      }
    ];
    setDB(DB_KEYS.USERS, users);
  }

  // 2. Seed Departments
  let departments = getDB(DB_KEYS.DEPARTMENTS);
  if (!departments || departments.length === 0) {
    departments = [
      { departmentId: "dep001", departmentName: "General Medicine", description: "Primary healthcare, diagnosis, and treatment of common adult medical conditions.", status: "Active" },
      { departmentId: "dep002", departmentName: "Cardiology", description: "Advanced heart care, diagnostics, and therapeutic interventions for cardiovascular health.", status: "Active" },
      { departmentId: "dep003", departmentName: "Dental", description: "Comprehensive dental services including scaling, fillings, root canals, and cosmetic dentistry.", status: "Active" },
      { departmentId: "dep004", departmentName: "Orthopedic", description: "Care for bone, joint, ligament, and muscle disorders, sports injuries, and joint replacements.", status: "Active" },
      { departmentId: "dep005", departmentName: "Pediatrics", description: "Compassionate healthcare and medical monitoring for infants, toddlers, children, and teenagers.", status: "Active" },
      { departmentId: "dep006", departmentName: "ENT", description: "Specialized treatment for diseases of the ear, nose, throat, and related structures of the head.", status: "Active" },
      { departmentId: "dep007", departmentName: "Dermatology", description: "Diagnosis and therapy for conditions related to skin, hair, nails, and cosmetic concerns.", status: "Active" }
    ];
    setDB(DB_KEYS.DEPARTMENTS, departments);
  }

  // 3. Seed Doctors
  let doctors = getDB(DB_KEYS.DOCTORS);
  let isDoctorsUpdated = false;

  if (!doctors || doctors.length === 0) {
    // Map default doctors to remove embedded schedule property
    doctors = DEFAULT_DOCTORS.map(({ schedule, ...doc }) => doc);
    isDoctorsUpdated = true;
  } else {
    // Self-healing: check if any active department has NO assigned doctors
    const activeDepts = departments.filter(d => d.status === 'Active');
    activeDepts.forEach(dept => {
      const assigned = doctors.filter(doc => doc.department === dept.departmentName);
      if (assigned.length === 0) {
        // Find default doctor templates for this department
        const templates = DEFAULT_DOCTORS.filter(d => d.department === dept.departmentName)
          .map(({ schedule, ...doc }) => doc);
        
        if (templates.length > 0) {
          doctors = [...doctors, ...templates];
          isDoctorsUpdated = true;
        }
      }
    });
  }

  if (isDoctorsUpdated) {
    setDB(DB_KEYS.DOCTORS, doctors);
  }

  // 4. Seed Schedules
  let schedules = getDB(DB_KEYS.SCHEDULES);
  let isSchedulesUpdated = false;

  if (!schedules || schedules.length === 0) {
    // Construct schedules from default templates
    schedules = DEFAULT_DOCTORS.map(doc => ({
      scheduleId: doc.schedule.scheduleId,
      doctorId: doc.doctorId,
      doctorName: doc.doctorName,
      department: doc.department,
      availableDays: doc.availableDays,
      startTime: doc.schedule.startTime,
      endTime: doc.schedule.endTime,
      slotDuration: doc.schedule.slotDuration,
      status: "Active"
    }));
    isSchedulesUpdated = true;
  } else {
    // Self-healing: verify every doctor in the database has an active schedule
    doctors.forEach(doc => {
      const hasSchedule = schedules.some(s => s.doctorId === doc.doctorId && s.status === 'Active');
      if (!hasSchedule) {
        // Look up default schedule in templates
        const template = DEFAULT_DOCTORS.find(d => d.doctorId === doc.doctorId);
        const schedInfo = template ? template.schedule : { scheduleId: 'sch_' + doc.doctorId, startTime: '09:00', endTime: '13:00', slotDuration: 30 };
        
        schedules.push({
          scheduleId: schedInfo.scheduleId || ('sch_' + doc.doctorId),
          doctorId: doc.doctorId,
          doctorName: doc.doctorName,
          department: doc.department,
          availableDays: doc.availableDays || ["Monday", "Wednesday", "Friday"],
          startTime: schedInfo.startTime,
          endTime: schedInfo.endTime,
          slotDuration: schedInfo.slotDuration,
          status: "Active"
        });
        isSchedulesUpdated = true;
      }
    });
  }

  if (isSchedulesUpdated) {
    setDB(DB_KEYS.SCHEDULES, schedules);
  }

  // 5. Ensure doctor login user accounts exist for all seeded doctors
  let currentUsers = getDB(DB_KEYS.USERS);
  let isUsersUpdated = false;

  doctors.forEach(doc => {
    const userExists = currentUsers.some(u => u.email.toLowerCase() === doc.email.toLowerCase());
    if (!userExists) {
      currentUsers.push({
        id: doc.doctorId,
        name: doc.doctorName,
        email: doc.email,
        role: "doctor",
        password: encodePassword("doctor123"),
        phone: doc.phone
      });
      isUsersUpdated = true;
    }
  });

  if (isUsersUpdated) {
    setDB(DB_KEYS.USERS, currentUsers);
  }

  // 6. Seed Appointments
  let appointments = getDB(DB_KEYS.APPOINTMENTS);
  if (!appointments || appointments.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    appointments = [
      {
        appointmentId: "apt001",
        patientId: "pat001",
        patientName: "Alex Johnson",
        doctorId: "doc001",
        doctorName: "Dr. Ravi Kumar",
        department: "General Medicine",
        appointmentDate: today,
        timeSlot: "09:30 AM",
        reasonForVisit: "Regular checkup and slight throat irritation.",
        status: "Confirmed"
      },
      {
        appointmentId: "apt002",
        patientId: "pat002",
        patientName: "Jane Doe",
        doctorId: "doc002",
        doctorName: "Dr. Priya Sharma",
        department: "Dental",
        appointmentDate: today,
        timeSlot: "10:30 AM",
        reasonForVisit: "Routine dental cleaning and whitening check.",
        status: "Pending"
      }
    ];
    setDB(DB_KEYS.APPOINTMENTS, appointments);
  }
};

// Dynamic calculation utility helpers

// Get doctor count per department name
export const getDoctorCountByDept = (deptName) => {
  const doctors = getDB(DB_KEYS.DOCTORS);
  return doctors.filter(doc => doc.department === deptName).length;
};

// Get list of available doctors
export const getAvailableDoctors = () => {
  const doctors = getDB(DB_KEYS.DOCTORS);
  return doctors.filter(doc => doc.status === 'Available');
};

// Get global patient count
export const getPatientCount = () => {
  const users = getDB(DB_KEYS.USERS);
  return users.filter(u => u.role === 'patient').length;
};

// Get appointment statistics (total, pending, confirmed, cancelled, completed, list)
export const getAppointmentStats = (patientId = null, doctorId = null, customList = null) => {
  const appointments = customList || getDB(DB_KEYS.APPOINTMENTS);
  const filtered = appointments.filter(apt => {
    if (patientId && apt.patientId !== patientId) return false;
    if (doctorId && apt.doctorId !== doctorId) return false;
    return true;
  });

  return {
    total: filtered.length,
    pending: filtered.filter(a => a.status === 'Pending').length,
    confirmed: filtered.filter(a => a.status === 'Confirmed').length,
    cancelled: filtered.filter(a => a.status === 'Cancelled').length,
    completed: filtered.filter(a => a.status === 'Completed').length,
    list: filtered
  };
};

// Get detailed department metrics (Total Docs, Available Docs, Timing Range, Avg Duration)
export const getDeptMetrics = (deptName) => {
  const doctors = getDB(DB_KEYS.DOCTORS);
  const schedules = getDB(DB_KEYS.SCHEDULES) || [];
  
  const deptDocs = doctors.filter(doc => doc.department === deptName);
  const totalDocs = deptDocs.length;
  const availableDocs = deptDocs.filter(doc => doc.status === 'Available').length;
  
  const deptSchedules = schedules.filter(sch => sch.department === deptName && sch.status === 'Active');
  
  let hoursText = '09:00 AM - 05:00 PM';
  if (deptSchedules.length > 0) {
    const startTimes = deptSchedules.map(s => s.startTime).sort();
    const endTimes = deptSchedules.map(s => s.endTime).sort();
    
    const formatTime12 = (time24) => {
      const [h, m] = time24.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };
    
    hoursText = `${formatTime12(startTimes[0])} - ${formatTime12(endTimes[endTimes.length - 1])}`;
  }

  const avgDuration = deptSchedules.length > 0
    ? Math.round(deptSchedules.reduce((acc, curr) => acc + curr.slotDuration, 0) / deptSchedules.length)
    : 30;

  return {
    totalDocs,
    availableDocs,
    hoursText,
    avgDuration
  };
};

// Get global system dashboard summary metrics
export const getDashboardSummary = () => {
  const doctors = getDB(DB_KEYS.DOCTORS);
  const departments = getDB(DB_KEYS.DEPARTMENTS);
  const appointments = getDB(DB_KEYS.APPOINTMENTS);
  
  return {
    doctorsCount: doctors.length,
    departmentsCount: departments.length,
    patientsCount: getPatientCount(),
    bookingsCount: appointments.length,
    availableDoctorsCount: getAvailableDoctors().length
  };
};
