<template>
    <div class="admin-container">
      <h2>Admin Panel - Create Slots</h2>
      <p>
        Create a new appointment slot. Users will be able to book this slot
        immediately.
      </p>
  
      <form @submit.prevent="createSlot" class="admin-form">
        <div class="form-group">
          <label for="date">Date</label>
          <input id="date" v-model="slotDate" type="date" required />
        </div>
  
        <div class="form-group">
          <label for="start-time">Start Time</label>
          <input id="start-time" v-model="startTime" type="time" required />
        </div>
  
        <div class="form-group">
          <label for="end-time">End Time</label>
          <input id="end-time" v-model="endTime" type="time" required />
        </div>
  
        <div class="form-group">
          <label for="max-guests">Max Guests (e.g., 3)</label>
          <input
            id="max-guests"
            v-model.number="maxGuests"
            type="number"
            min="1"
            required
          />
        </div>
  
        <button type->
          {{ isSubmitting ? 'Creating...' : 'Create Slot' }}
        </button>
  
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { db } from '../services/firebaseConfig.js'
  import { collection, addDoc, Timestamp } from 'firebase/firestore'
  
  // Form data
  const slotDate = ref('')
  const startTime = ref('')
  const endTime = ref('')
  const maxGuests = ref(3)
  
  // State
  const isSubmitting = ref(false)
  const successMessage = ref('')
  const errorMessage = ref('')
  
  const createSlot = async () => {
    // Clear previous messages
    successMessage.value = ''
    errorMessage.value = ''
    
    if (!slotDate.value || !startTime.value || !endTime.value || !maxGuests.value) {
      errorMessage.value = "Please fill out all fields."
      return
    }
  
    isSubmitting.value = true
  
    try {
      // 1. Combine date and time strings into JS Date objects
      const startDateTimeStr = `${slotDate.value}T${startTime.value}`
      const endDateTimeStr = `${slotDate.value}T${endTime.value}`
      
      const startDateTime = new Date(startDateTimeStr)
      const endDateTime = new Date(endDateTimeStr)
  
      if (endDateTime <= startDateTime) {
        throw new Error("End time must be after start time.")
      }
  
      // 2. Create the new slot document in Firestore
      const slotsCollection = collection(db, 'slots')
      await addDoc(slotsCollection, {
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime),
        maxGuests: Number(maxGuests.value),
        currentGuestCount: 0
      })
  
      successMessage.value = `Successfully created slot on ${slotDate.value} from ${startTime.value} to ${endTime.value}.`
  
      // 3. Reset form
      slotDate.value = ''
      startTime.value = ''
      endTime.value = ''
      maxGuests.value = 3
  
    } catch (error) {
      console.error('Error creating slot: ', error)
      errorMessage.value = `Failed to create slot: ${error.message}`
    } finally {
      isSubmitting.value = false
    }
  }
  </script>
  
  <style scoped>
  .admin-container {
    max-width: 500px;
    margin: 0 auto;
    border: 1px solid #eee;
    padding: 20px;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  .admin-form {
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
  .form-group input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .success {
    color: green;
  }
  .error {
    color: red;
  }
  </style>