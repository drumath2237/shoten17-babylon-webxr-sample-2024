import "./style.css";
import {
  Engine,
  type Mesh,
  MeshBuilder,
  PolygonMeshBuilder,
  Scene,
  Vector2,
  WebXRFeatureName,
  type WebXRPlaneDetector,
} from "@babylonjs/core";

const main = async () => {
  const renderCanvas =
    document.querySelector<HTMLCanvasElement>("#renderCanvas");
  if (!renderCanvas) {
    return;
  }

  const engine = new Engine(renderCanvas);
  const scene = new Scene(engine);

  scene.createDefaultCameraOrLight(true, true, true);

  MeshBuilder.CreateBox("box", { size: 0.5 });

  const xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      requiredFeatures: ["plane-detection"],
    },
  });

  const featureManager = xr.baseExperience.featuresManager;
  const planeDetector = featureManager.enableFeature(
    WebXRFeatureName.PLANE_DETECTION,
    "latest",
  ) as WebXRPlaneDetector;

  const planeMap = new Map<number, Mesh>();

  planeDetector.onPlaneAddedObservable.add(
    ({ id, polygonDefinition, transformationMatrix }) => {
      const meshBuilder = new PolygonMeshBuilder(
        "builder",
        polygonDefinition.map((v) => new Vector2(v.x, v.z)),
        scene,
      );
      const mesh = meshBuilder.build(false, 0.01);
      transformationMatrix.decomposeToTransformNode(mesh);
      planeMap.set(id, mesh);
    },
  );

  planeDetector.onPlaneUpdatedObservable.add(
    ({ id, polygonDefinition, transformationMatrix }) => {
      const meshBuilder = new PolygonMeshBuilder(
        "builder",
        polygonDefinition.map((v) => new Vector2(v.x, v.z)),
        scene,
      );
      const mesh = meshBuilder.build(false, 0.01);
      transformationMatrix.decomposeToTransformNode(mesh);
      planeMap.set(id, mesh);
    },
  );

  planeDetector.onPlaneRemovedObservable.add(({ id }) => {
    planeMap.get(id)?.dispose();
    planeMap.delete(id);
  });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
};

main();
