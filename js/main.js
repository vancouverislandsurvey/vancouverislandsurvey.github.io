window.onload = init
window.onresize = resize

let renderer, scene, camera
let editor
let rotation = 0.003

function init() {
  
  renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: false })
  renderer.setPixelRatio(devicePixelRatio)
//   renderer.antialias = true;
  
  document.body.append(renderer.domElement)
  scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera()
    camera.position.set(150,0,50)
    camera.up.set(0,0,1)

  scene.add( camera )
  
  const light = new THREE.HemisphereLight( 0xffffff, 0x000000 )
  scene.add( light )
  
  terrain = new Terrain()
  
  resize()
  window.requestAnimationFrame(main)
  console.log('Loaded')
  
}

function resize(){
  
  let w = window.innerWidth
  let h = window.innerHeight
  
  renderer.setSize(w,h)
  
  camera.aspect = w/h
  camera.setViewOffset ( w, h, 0, h/8, w, h )
  camera.updateProjectionMatrix()
}

function main(){
  camera.position.applyAxisAngle(camera.up, rotation)
  camera.lookAt(0,0,0)
  renderer.render(scene, camera)
  window.requestAnimationFrame(main)
}

function Terrain(){
  
  const scope = this
  
  const size = 128
  const resolution = 1
  const xl = size / resolution
  const yl = xl

//   const neighbours = []

//     neighbours[0] = -1
//     neighbours[1] = 1
//     neighbours[2] = -limit
//     neighbours[3] = limit
//     neighbours[4] = limit-1
//     neighbours[5] = limit+1
//     neighbours[6] = -limit-1
//     neighbours[7] = -limit+1
  
  this.generate = function( xl, yl ) {

  const size = xl * yl
  const data = new Uint8Array( size )
  //const data = []
  data.length = xl * yl
  const perlin = new ImprovedNoise()
  const z = Math.random() * 100
  let quality = 1

  for ( let j = 0; j < 4; j ++ ) {
  for ( let i = 0; i < size; i ++ ) {
  let x = i % xl
  let y = ( i / xl )
  data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 )
  }
  quality *= 5
  }
    
    return data
  }

  const geometry = new THREE.Geometry()

  const data = this.generate( xl, yl )

  for( let x = 0; x < xl; x++ ){
  for( let y = 0; y < yl; y++ ){
    let i = x + ( y * xl )
    let z = data[i] * 0.5
    geometry.vertices.push( new THREE.Vector3( x, y, z ) )

  }
  }
  
  geometry.verticesNeedUpdate = true

  const color = 0xffffff
  const c2 = new THREE.Color(0xffffff)
  for( let i in geometry.vertices ){          
    geometry.colors[i] = new THREE.Color(color)
    geometry.colors[i].lerp( c2, i/geometry.vertices.length )
  }
  
  geometry.colorsNeedUpdate = true
  geometry.elementsNeedUpdate = true
  geometry.computeFaceNormals()
  geometry.computeVertexNormals()
  geometry.center()
  
  const sprite = new THREE.TextureLoader().load( 'images/particle.svg' );

  const material = new THREE.PointsMaterial(
  {size: 0.75, sizeAttenuation: true, vertexColors: THREE.VertexColors, map: sprite } )

  material.blending = THREE.AdditiveBlending
    
  const points = new THREE.Points( geometry, material )
  scene.add(points)
  
  }
  
//   function keyup( event ){

//     switch( event.key ){
//         case( ' ' ):
//         break
//         case( 'ArrowUp' ):
//         break
//         case( 'ArrowDown' ):
//         break
//         case( 'ArrowLeft' ):
//         break
//         case( ' ArrowRight' ):
//         break
//     }
//  }