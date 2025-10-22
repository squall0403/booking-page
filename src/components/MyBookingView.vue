<template>
  <div class="my-booking-container">
    <h2>Find My Booking</h2>
    <p>Enter your phone number to find your registered slot.</p>

    <form @submit.prevent="handleSearch" class="booking-form">
      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input 
          id="phone" 
          v-model="phone" 
          type="tel" 
          placeholder="e.g., 0381234567" 
          required 
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Searching...' : 'Find Booking' }}
      </button>
    </form>

    <div v-if="loading" class="loading">
      <p>Searching for your booking...</p>
    </div>

    <div v-if="noResults" class="no-results">
      <p>
        <strong>No booking found.</strong>
        <br />
        Please check your details and try again.
      </p>
    </div>

    <div v-if="foundBookings.length > 0" class="results-container">
      <h3>Your Booked Slots:</h3>
      <div 
        v-for="booking in foundBookings" 
        :key="booking.id" 
        class="booking-card"
      >
        <h4>{{ formatSlotHeader(booking.slot.startTime, booking.slot.endTime) }}</h4>
        <p>
          <strong>Name:</strong> {{ booking.fullName }}<br />
          <strong>Email:</strong> {{ booking.email }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from '../services/firebaseConfig'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc 
} from 'firebase/firestore'

// Form and state refs
const phone = ref('')
const loading = ref(false)
const noResults = ref(false)
const foundBookings = ref([])

// The search function
const handleSearch = async () => {
  if (!phone.value) return

  loading.value = true
  noResults.value = false
  foundBookings.value = []

  try {
    const bookingsRef = collection(db, 'bookings')
    const q = query(
      bookingsRef, 
      where('phone', '==', phone.value.trim())
    )
    
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      noResults.value = true
      loading.value = false
      return
    }

    const bookingPromises = querySnapshot.docs.map(async (bookingDoc) => {
      const bookingData = bookingDoc.data()
      const slotRef = doc(db, 'slots', bookingData.slotId)
      const slotDoc = await getDoc(slotRef)

      if (slotDoc.exists()) {
        return {
          id: bookingDoc.id,
          ...bookingData,
          slot: slotDoc.data()
        }
      }
      return null
    })

    const combinedResults = await Promise.all(bookingPromises)

    foundBookings.value = combinedResults
      .filter(b => b !== null)
      .map(b => ({
        ...b,
        slot: {
          ...b.slot,
          startTime: b.slot.startTime.toDate(),
          endTime: b.slot.endTime.toDate()
        }
      }))

    if (foundBookings.value.length === 0) noResults.value = true

  } catch (error) {
    console.error("Error searching for bookings: ", error)
    noResults.value = true
  } finally {
    loading.value = false
  }
}

// Helper function to format date
const formatSlotHeader = (startTime, endTime) => {
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' }
  const timeOptions = { hour: 'numeric', minute: 'numeric' }
  const dateStr = startTime.toLocaleDateString('en-US', dateOptions)
  const startTimeStr = startTime.toLocaleTimeString('en-US', timeOptions)
  const endTimeStr = endTime.toLocaleTimeString('en-US', timeOptions)
  return `${dateStr}  |  ${startTimeStr} - ${endTimeStr}`
}
</script>

<style scoped>
/* All styles from before, minus the .cancel-button style */
.my-booking-container {
  max-width: 600px;
  margin: 0 auto;
}
.booking-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.loading, .no-results {
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-top: 20px;
}
.results-container {
  margin-top: 30px;
}
.booking-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.booking-card h4 {
  margin-top: 0;
  color: #0056b3;
}
.booking-card p {
  line-height: 1.6;
  margin-bottom: 0;
}
</style>