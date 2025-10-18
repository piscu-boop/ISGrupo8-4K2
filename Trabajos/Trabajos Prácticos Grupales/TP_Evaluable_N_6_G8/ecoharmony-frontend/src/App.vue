<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <h1>EcoHarmony Park</h1>
        <p>Sistema de Inscripción a Actividades</p>
      </div>
    </header>
    
    <main class="main">
      <div class="container">
        <router-view />
      </div>
    </main>
    
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 EcoHarmony Park. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-medium));
  color: var(--white);
  padding: 2rem 0;
  text-align: center;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
}

.header p {
  margin: 0.5rem 0 0 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.main {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.footer {
  background: var(--primary-dark);
  color: var(--white);
  text-align: center;
  padding: 1rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
