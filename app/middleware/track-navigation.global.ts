export default defineNuxtRouteMiddleware((to, from) => {
  if (from) {
    to.meta.from = from.fullPath
  }
})
