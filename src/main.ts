import "./style.css";
import {
  Engine,
  type IWebXRPlane,
  type Mesh,
  MeshBuilder,
  PolygonMeshBuilder,
  Scene,
  Vector2,
  WebXRFeatureName,
  type WebXRPlaneDetector,
} from "@babylonjs/core";

import earcut from "earcut";

const main = async () => {
  const renderCanvas =
    document.querySelector<HTMLCanvasElement>("#renderCanvas");
  if (!renderCanvas) {
    return;
  }

  const engine = new Engine(renderCanvas);
  const scene = new Scene(engine);

  scene.createDefaultCameraOrLight(true, true, true);

  const box = MeshBuilder.CreateBox("box", { size: 0.5 });

  const xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      requiredFeatures: ["plane-detection"],
      referenceSpaceType: "unbounded",
    },
  });

  const featureManager = xr.baseExperience.featuresManager;
  const planeDetector = featureManager.enableFeature(
    WebXRFeatureName.PLANE_DETECTION,
    "latest",
  ) as WebXRPlaneDetector;

  const planeMap = new Map<number, Mesh>();

  const updatePlaneMapCallback = ({
    id,
    polygonDefinition,
    transformationMatrix,
  }: IWebXRPlane) => {
    const meshBuilder = new PolygonMeshBuilder(
      "builder",
      polygonDefinition.map((v) => new Vector2(v.x, v.z)),
      scene,
      earcut,
    );
    const mesh = meshBuilder.build(false, 0.01);
    transformationMatrix.decomposeToTransformNode(mesh);

    planeMap.get(id)?.dispose();
    planeMap.set(id, mesh);
  };

  planeDetector.onPlaneAddedObservable.add(updatePlaneMapCallback);
  planeDetector.onPlaneUpdatedObservable.add(updatePlaneMapCallback);
  planeDetector.onPlaneRemovedObservable.add(({ id }) => {
    planeMap.get(id)?.dispose();
    planeMap.delete(id);
  });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
};

main();
