import { FC } from "react";
import { PatcherStatusEnum } from "./App";
import Loader from "./Loader";
import {
  DocumentArrowDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface Props {
  patcherStatus: PatcherStatusEnum;
}

const patcherIndicator: FC<Props> = ({ patcherStatus }) => {
  if (patcherStatus === "IDLE") {
    return null;
  }

  if (patcherStatus === "PATCHING") {
    return <Loader />;
  }

  if (patcherStatus === "COMPLETE") {
    return <DocumentArrowDownIcon className="status-icon" />;
  }

  if (patcherStatus === "ERROR") {
    return <ExclamationCircleIcon className="status-icon" />;
  }

  return null;
};

export default patcherIndicator;
