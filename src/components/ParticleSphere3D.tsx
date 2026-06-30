import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { inSphere } from 'maath/random';

export default function ParticleSphere3D(props: any) {
  const ref = useRef<any>();
  
  // Create a spherical distribution of points (array length must be divisible by 3)
  const sphere = new Float32Array(5001);
  inSphere(sphere, { radius: 1.5 });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere as Float32Array} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#EAB308" // yellow-500
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}
