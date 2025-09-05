import { PrismaClient } from '@prisma/client'
import seedrandom from 'seedrandom'

const prisma = new PrismaClient()
const rng = seedrandom('tradition-agro')

// Productos y regiones
const productos = [
  'café', 'maíz', 'arroz', 'cacao', 'habichuela', 'papa', 'yuca', 'plátano',
  'banano', 'naranja', 'leche', 'carne bovina', 'cerdo', 'pollo', 'huevo'
]
const regiones = [
  { nombre: 'Antioquia', ciudad: 'Medellín', lat: 6.25184, lng: -75.56359 },
  { nombre: 'Cundinamarca', ciudad: 'Bogotá', lat: 4.7110, lng: -74.0721 },
  { nombre: 'Valle', ciudad: 'Cali', lat: 3.4516, lng: -76.5320 },
  { nombre: 'Santander', ciudad: 'Bucaramanga', lat: 7.1197, lng: -73.1256 },
  { nombre: 'Huila', ciudad: 'Neiva', lat: 2.9304, lng: -75.2819 }
]

// Helper para walk y outliers
function randomWalk(prev: number, step: number = 0.05, outlier = false) {
  let delta = (rng() - 0.5) * step * 2
  if (outlier) delta += (rng() - 0.5) * step * 10
  return Math.max(10, prev * (1 + delta))
}

async function main() {
  // Seeds de usuarios
  await prisma.user.createMany({
    data: [
      { email: 'admin@tradition.com', password: 'Admin#12345', name: 'Admin', role: 'ADMIN' },
      { email: 'analista@tradition.com', password: 'Analista#12345', name: 'Analista', role: 'ANALISTA' },
      { email: 'afiliado@tradition.com', password: 'Afiliado#12345', name: 'Afiliado', role: 'AFILIADO' },
    ],
    skipDuplicates: true,
  })
  // Productos y regiones
  await prisma.producto.createMany({ data: productos.map(nombre => ({ nombre })), skipDuplicates: true })
  await prisma.region.createMany({ data: regiones, skipDuplicates: true })

  // Spot mensual 36 meses + D+1 diario 90 días
  const prod = await prisma.producto.findMany()
  const reg = await prisma.region.findMany()
  let base = 1000
  for (let p of prod) {
    for (let r of reg) {
      let prev = base * (1 + rng())
      // Mensual 36 meses
      for (let m = 0; m < 36; m++) {
        const fecha = new Date()
        fecha.setMonth(fecha.getMonth() - (35 - m))
        let outlier = rng() < 0.08
        let val = randomWalk(prev, 0.05, outlier)
        prev = val
        await prisma.precioSpot.create({
          data: {
            productoId: p.id,
            regionId: r.id,
            fecha,
            compra: val,
            venta: val * (1 + ((rng() - 0.5) * 0.01)),
            variacion: (rng() - 0.5) * 0.1,
            outlier,
          }
        })
      }
      // Diario 90 días
      prev = base * (1 + rng())
      for (let d = 0; d < 90; d++) {
        const fecha = new Date()
        fecha.setDate(fecha.getDate() - (89 - d))
        let val = randomWalk(prev, 0.03)
        prev = val
        await prisma.precioSpot.create({
          data: {
            productoId: p.id,
            regionId: r.id,
            fecha,
            compra: val,
            venta: val * (1 + ((rng() - 0.5) * 0.01)),
            variacion: (rng() - 0.5) * 0.1,
            outlier: false,
          }
        })
      }
    }
  }
  // Futuros para 5 productos
  const futurosProd = prod.filter(p => ['café', 'maíz', 'arroz', 'cacao', 'leche'].includes(p.nombre))
  for (let p of futurosProd) {
    for (let r of reg) {
      for (let v = 0; v < 6; v++) {
        const fecha = new Date()
        fecha.setMonth(fecha.getMonth() + v)
        await prisma.precioFuturo.create({
          data: {
            productoId: p.id,
            regionId: r.id,
            fecha: new Date(),
            vencimiento: fecha,
            base: 1000 + v * 10 + rng() * 50,
            carry: rng() * 20,
          }
        })
      }
    }
  }
  // Estacionalidad sintética
  for (let p of prod) {
    for (let r of reg) {
      for (let mes = 1; mes <= 12; mes++) {
        await prisma.estacionalidad.create({
          data: {
            productoId: p.id,
            regionId: r.id,
            mes,
            promedio5a: 1000 + rng() * 100,
            p10: 900 + rng() * 100,
            p50: 1100 + rng() * 100,
            p90: 1200 + rng() * 100,
          }
        })
      }
    }
  }
  // Índice Agro Tradition
  let ponderaciones = [
    { nombre: 'Granos', ponderacion: 0.3 },
    { nombre: 'Frutas', ponderacion: 0.2 },
    { nombre: 'Lácteos', ponderacion: 0.15 },
    { nombre: 'Cárnicos', ponderacion: 0.15 },
    { nombre: 'Avícola', ponderacion: 0.1 },
    { nombre: 'Otros', ponderacion: 0.1 }
  ]
  for (let p of ponderaciones) {
    await prisma.indice.create({ data: p })
  }
  const indices = await prisma.indice.findMany()
  for (let i of indices) {
    let prev = 1000
    for (let d = 0; d < 180; d++) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - (179 - d))
      let val = randomWalk(prev, 0.04)
      prev = val
      await prisma.indiceValor.create({
        data: {
          indiceId: i.id,
          fecha,
          valor: val,
        }
      })
    }
  }
  // Normas dummy
  await prisma.norma.createMany({
    data: [
      { nombre: "Resolución 001", descripcion: "Norma dummy demostración." },
      { nombre: "Resolución 002", descripcion: "Norma dummy demostración." },
    ],
    skipDuplicates: true
  })
  // Datos dummy PQR
  await prisma.pqr.create({
    data: {
      radicado: "PQR-2025-0001",
      nombre: "Usuario Dummy",
      email: "dummy@tradition.com",
      mensaje: "Ejemplo PQR dummy.",
      estado: "Recibido",
    }
  })
  // ArchivoExport dummy
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  await prisma.archivoExport.create({
    data: {
      tipo: "CSV",
      usuarioId: admin!.id,
      watermark: "DATOS DEMO",
    }
  })
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect())