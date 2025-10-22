<template>
  <div id="layout">
    <header>
      <img src="../src/assets/brain-life-logo.webp"></img>
      <h1>EEG Data collection</h1>
    </header>
    <hr/>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
/* You can add global layout styles here */
#layout {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
header{
  display: flex;
  flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.5em;
}
header h1{
  margin-top: 0px;
  margin-bottom: 0px;
}
header img{
  width: 20%;
  height: unset;
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    align-items: flex-start;
  }
  header img {
    width: 50%;
  }
}
</style>
