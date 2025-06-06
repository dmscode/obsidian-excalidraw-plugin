import { NonDeletedExcalidrawElement } from "@zsviczian/excalidraw/types/element/src/types";
import { DEVICE, REG_LINKINDEX_INVALIDCHARS } from "src/constants/constants";
import { getParentOfClass } from "./obsidianUtils";
import { App, Notice, TFile, WorkspaceLeaf } from "obsidian";
import { getLinkParts } from "./utils";
import ExcalidrawView from "src/view/ExcalidrawView";

export const useDefaultExcalidrawFrame = (element: NonDeletedExcalidrawElement) => {
  return !(element.link.startsWith("[") || element.link.startsWith("file:") || element.link.startsWith("data:")); // && !element.link.match(TWITTER_REG);
}

export const leafMap = new Map<string, WorkspaceLeaf>();

//This is definitely not the right solution, feels like sticking plaster
//patch disappearing content on mobile
export const patchMobileView = (view: ExcalidrawView) => {
  if(DEVICE.isDesktop) return;
  console.log("patching mobile view");
  const parent = getParentOfClass(view.containerEl,"mod-top");
  if(parent) {
    if(!parent.hasClass("mod-visible")) {
      parent.addClass("mod-visible");
    }
  }
}

export const processLinkText = (linkText: string, view:ExcalidrawView): { subpath:string, file:TFile } => {
  let subpath:string = null;

  if (linkText.search("#") > -1) {
    const linkParts = getLinkParts(linkText, view.file);
    subpath = `#${linkParts.isBlockRef ? "^" : ""}${linkParts.ref}`;
    linkText = linkParts.path;
  }

  if (linkText.match(REG_LINKINDEX_INVALIDCHARS)) {
    return {subpath, file: null};
  }

  const file = view.app.metadataCache.getFirstLinkpathDest(
    linkText,
    view.file.path,
  );

  return { subpath, file };
}

export const generateEmbeddableLink = (src: string, theme: "light" | "dark"):string => {
/*  const twitterLink = src.match(TWITTER_REG);
  if (twitterLink) {
    const tweetID = src.match(/.*\/(\d*)\?/)[1];
    if (tweetID) {
      return `https://platform.twitter.com/embed/Tweet.html?frame=false&hideCard=false&hideThread=false&id=${tweetID}&lang=en&theme=${theme}&width=550px`;
      //src = `https://twitframe.com/show?url=${encodeURIComponent(src)}`;
    }
  }*/
  return src;
}

export function setFileToLocalGraph(app: App, file: TFile) {
  let lgv;
  app.workspace.iterateAllLeaves((l) => {
    if (l.view?.getViewType() === "localgraph") lgv = l.view;
  });
  try {
    if (lgv) {
      //@ts-ignore
      lgv.loadFile(file);
    }
  } catch (e) {
    console.error(e);
  }
}