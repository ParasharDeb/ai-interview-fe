import { buildInterviewWebSocketUrl } from "../lib/config";

type InterviewSockettypes = {
  onOpen?: () => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  InterviewID?:String
  role?: String
};
export class InterviewSocket {
  public websocket:WebSocket|null
  public InterviewID:String|undefined
  public role:String|undefined
  public onOpen?: () => void;
  public onMessage?: (event: MessageEvent) => void;
  public onClose?: (event: CloseEvent) => void;
  public onError?: (event: Event) => void;
  constructor(config:InterviewSockettypes) {
    this.websocket = null;
    this.InterviewID=config.InterviewID;
    this.role=config.role;
    this.onOpen = config.onOpen;
    this.onMessage = config.onMessage;
    this.onClose = config.onClose;
    this.onError = config.onError;
  }

  connect() {
    const wsUrl = buildInterviewWebSocketUrl(
      String(this.InterviewID ?? ""),
      String(this.role || "General")
    );

    this.websocket = new WebSocket(wsUrl);
    this.websocket.binaryType = "arraybuffer";

    this.websocket.onopen = () => {
      if (this.onOpen) this.onOpen();
    };

    this.websocket.onmessage = (event) => {
      if (this.onMessage) this.onMessage(event);
    };

    this.websocket.onclose = (event) => {
      if (this.onClose) this.onClose(event);
    };

    this.websocket.onerror = (event) => {
      if (this.onError) this.onError(event);
    };
  }

  send(data:any) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(data);
    }
  }

  sendText(text:any) {
    this.send(JSON.stringify({ type: "message", text }));
  }

  sendImage(base64Data:any, mimeType = "image/jpeg") {
    this.send(
      JSON.stringify({
        type: "image",
        mime_type: mimeType,
        data: base64Data,
      })
    );
  }
  sendAudio(audio: ArrayBuffer) {
    this.send(audio);
  }
  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  isConnected() {
    return this.websocket && this.websocket.readyState === WebSocket.OPEN;
  }
}