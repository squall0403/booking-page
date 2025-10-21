<template>
    <div class="booking-container">
      <h2>Book Your Appointment</h2>
      <p>Please fill out your details and select an available slot.</p>
  
      <form @submit.prevent="handleBooking" class="booking-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input id="name" v-model="fullName" type="text" required />
        </div>
  
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required />
        </div>
  
        <div class="form-group">
          <label for="phone">Phone</label>
          <input id="phone" v-model="phone" type="tel" />
        </div>
  
        <div class="form-group">
          <label for="slot">Select a Slot</label>
          <select id="slot" v-model="selectedSlotId" required>
            <option :value="null" disabled>
              {{ loading ? 'Loading slots...' : '--- Please select a time ---' }}
            </option>
            <option v-for="slot in availableSlots" :key="slot.id" :value="slot.id">
              {{ slot.formattedDate }} ({{ slot.spotsLeft }} spots left)
            </option>
          </select>
          <p v-if="!loading && availableSlots.length === 0" class="no-slots">
            We're sorry, there are no available appointments at this time.
          </p>
        </div>
  
        <button class="button" type="submit" :disabled="isSubmitting || !selectedSlotId">
          {{ isSubmitting ? 'Booking...' : 'Book Now' }}
        </button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { db } from '../services/firebaseConfig.js'
  import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    runTransaction,
    addDoc,
    Timestamp
  } from 'firebase/firestore'
  
  // User form data
  const fullName = ref('')
  const email = ref('')
  const phone = ref('')
  const selectedSlotId = ref(null)
  
  // State management
  const loading = ref(true)
  const isSubmitting = ref(false)
  const allSlots = ref([]) // Stores raw slot data from Firebase
  let unsubscribe = null // To stop the listener
  
  // 1. Fetch and listen for available slots
  onMounted(() => {
    const slotsCollection = collection(db, 'slots')
    
    // Query for slots that are in the future
    const q = query(
      slotsCollection,
      where('startTime', '>', Timestamp.now())
    )
  
    // onSnapshot creates a real-time listener
    unsubscribe = onSnapshot(q, (querySnapshot) => {
      allSlots.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loading.value = false
    }, (error) => {
      console.error("Error fetching slots: ", error)
      loading.value = false
    })
  })
  
  // Unsubscribe from the listener when the component is destroyed
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })
  
  // 2. Computed property to format slots for the UI
  const availableSlots = computed(() => {
    return allSlots.value
      // Client-side filter for slots that are not full
      .filter(slot => slot.currentGuestCount < slot.maxGuests)
      // Sort by start time
      .sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis())
      // Format for display
      .map(slot => {
        const startTime = slot.startTime.toDate()
        const endTime = slot.endTime.toDate()
        
        const options = { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }
        const startString = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })
        const endString = endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })
  
        return {
          id: slot.id,
          formattedDate: `${startTime.toLocaleDateString('en-US', options)} - ${endString}`,
          spotsLeft: slot.maxGuests - slot.currentGuestCount
        }
      })
  })
  
  // 3. The booking transaction function
  const handleBooking = async () => {
    if (!selectedSlotId.value || !fullName.value || !email.value) {
      alert('Please fill in all fields and select a slot.')
      return
    }
  
    isSubmitting.value = true
    
    const slotRef = doc(db, 'slots', selectedSlotId.value)
    const bookingsCol = collection(db, 'bookings')
  
    try {
      await runTransaction(db, async (transaction) => {
        // a. Read the slot
        const slotDoc = await transaction.get(slotRef)
        if (!slotDoc.exists()) {
          throw new Error('Slot does not exist!')
        }
  
        const slotData = slotDoc.data()
  
        // b. Check if slot is full (this is the critical check)
        if (slotData.currentGuestCount >= slotData.maxGuests) {
          throw new Error('Sorry, this slot just filled up. Please select another.')
        }
  
        // c. If not full, update the count and create the booking
        transaction.update(slotRef, {
          currentGuestCount: slotData.currentGuestCount + 1
        })
  
        transaction.set(doc(bookingsCol), {
          slotId: selectedSlotId.value,
          fullName: fullName.value,
          email: email.value,
          phone: phone.value,
          bookingTime: Timestamp.now()
        })
      })
  
      alert('Booking successful! We look forward to seeing you.')
      // Clear form
      fullName.value = ''
      email.value = ''
      phone.value = ''
      selectedSlotId.value = null
  
    } catch (error) {
      console.error('Booking failed: ', error)
      alert(`Booking failed: ${error.message}`)
    } finally {
      isSubsubmitting.value = false
    }
  }
  </script>
  
  <style scoped>
  /* Add some basic styling */
  .booking-container {
    max-width: 500px;
    margin: 0 auto;
  }
  .booking-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
  }
  .form-group label {
    margin-bottom: 5px;
    font-weight: bold;
  }
  .form-group input,
  .form-group select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .no-slots {
    color: #888;
    font-style: italic;
  }
  </style>