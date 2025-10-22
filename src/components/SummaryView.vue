<template>
  <div class="summary-container">
    <h2>Booking Summary</h2>

    <div class="filter-controls">
      <input type="checkbox" id="hide-past" v-model="hidePast" />
      <label for="hide-past">Hide past slots</label>
    </div>

    <div v-if="loading" class="loading">Loading summary...</div>

    <div v-if="!loading && groupedSummary.length === 0" class="no-bookings">
      There are no matching bookings to display.
    </div>

    <div
      v-for="slot in groupedSummary"
      :key="slot.id"
      class="slot-group"
    >
      <h3>{{ formatSlotHeader(slot.startTime, slot.endTime) }}</h3>
      <p class="slot-capacity">
        ({{ slot.currentGuestCount }} / {{ slot.maxGuests }} spots filled)
      </p>

      <ul class="booking-list">
        <li v-for="booking in slot.bookings" :key="booking.id" class="booking-item">
          <strong>{{ booking.fullName }}</strong>
          <span>Email: {{ booking.email }}</span>
          <span>Phone: {{ booking.phone }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../services/firebaseConfig'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

// Refs to hold the raw data
const allSlots = ref([])
const allBookings = ref([])
const loading = ref(true)

// NEW: Ref for the checkbox
const hidePast = ref(true) // Default to hiding past slots

// Fetch all slots and all bookings on component mount
onMounted(async () => {
  try {
    // This query ALREADY sorts by date and then start time.
    const slotsQuery = query(collection(db, 'slots'), orderBy('startTime', 'asc'))
    
    const bookingsQuery = collection(db, 'bookings')

    const [slotsSnapshot, bookingsSnapshot] = await Promise.all([
      getDocs(slotsQuery),
      getDocs(bookingsQuery)
    ])

    allSlots.value = slotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    allBookings.value = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

  } catch (error) {
    console.error("Error fetching summary data: ", error)
  } finally {
    loading.value = false
  }
})

// UPDATED: Computed property now filters based on the checkbox
const groupedSummary = computed(() => {
  const now = new Date()

  return allSlots.value
    // 1. Map data and find bookings
    .map(slot => {
      const bookingsForThisSlot = allBookings.value
        .filter(booking => booking.slotId === slot.id)
        .sort((a, b) => a.fullName.localeCompare(b.fullName))

      return {
        ...slot,
        startTime: slot.startTime.toDate(), // Convert Firebase Timestamp to JS Date
        endTime: slot.endTime.toDate(),     // Convert Firebase Timestamp to JS Date
        bookings: bookingsForThisSlot
      }
    })
    // 2. NEW: Filter based on the 'hidePast' checkbox
    .filter(slot => {
      if (!hidePast.value) {
        return true // If checkbox is unchecked, show all
      }
      // Otherwise, only show slots where the *end time* is in the future
      return slot.endTime > now
    })
    // 3. Filter out slots that have no bookings
    .filter(slot => slot.bookings.length > 0)
})

// Helper function to format the date/time header (no change)
const formatSlotHeader = (startTime, endTime) => {
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const timeOptions = { hour: 'numeric', minute: 'numeric' }

  const dateStr = startTime.toLocaleDateString('en-US', dateOptions)
  const startTimeStr = startTime.toLocaleTimeString('en-US', timeOptions)
  const endTimeStr = endTime.toLocaleTimeString('en-US', timeOptions)

  return `${dateStr}  |  ${startTimeStr} - ${endTimeStr}`
}
</script>

<style scoped>
.summary-container {
  max-width: 800px;
  margin: 0 auto;
}
/* NEW: Style for the filter checkbox */
.filter-controls {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-controls label {
  font-weight: bold;
  cursor: pointer;
}
.filter-controls input {
  cursor: pointer;
}

.loading, .no-bookings {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  padding: 40px;
}
.slot-group {
  margin-bottom: 30px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.slot-group h3 {
  background-color: #f9f9f9;
  padding: 15px 20px;
  margin: 0;
  border-bottom: 1px solid #eee;
}
.slot-capacity {
  padding: 0 20px 10px;
  font-style: italic;
  color: #333;
}
.booking-list {
  list-style: none;
  padding: 0 20px 20px;
  margin: 0;
}
.booking-item {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}
.booking-item:last-child {
  border-bottom: none;
}
.booking-item strong {
  min-width: 200px;
}
.booking-item span {
  color: #555;
}

.filter-controls * {
  margin-bottom: 0;
}
</style>