import * as dotenv from "dotenv";
import { ServerLive } from "./Api";
import * as Layer from "effect/Layer";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";

dotenv.config();

Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
