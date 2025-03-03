import * as Layer from "effect/Layer";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import { ServerLive } from "./Api";
import dotenv from "dotenv";

dotenv.config();

Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
