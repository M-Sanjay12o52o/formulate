import { Message } from "@formulate/shared-types";

const welcomeMessage: Message = {
  text: "Welcome to Formulate!",
  timestamp: new Date(),
};

export default function Home() {
  return (
    <div>
      <h1>{welcomeMessage.text}</h1>
      <p>Logged at: {welcomeMessage.timestamp.toLocaleTimeString()}</p>
    </div>
  );
}
