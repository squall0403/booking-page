<template>
    <div class="not-found-container">
      <h1>404 - Page Not Found</h1>
      <p>We're sorry, but the page you are looking for does not exist.</p>
      <RouterLink to="/">Go to the Booking Page</RouterLink>
    </div>
  </template>
  
  <script setup>
  // This component doesn't need any script logic
  </script>
  
  <style scoped>
  .not-found-container {
    text-align: center;
    padding-top: 50px;
  }
  h1 {
    font-size: 3rem;
    color: #333;
  }
  p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 30px;
  }
  a {
    font-size: 1rem;
    color: #007bff;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  </style>