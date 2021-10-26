import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import { api } from "../../services/api";
import { Message } from "../../models/message";

import styles from "./styles.module.scss";
import logoImg from "../../assets/logo.svg";

const socket = io("http://localhost:4000");

const messagesQueue: Message[] = [];

socket.on("new_message", (newMessage: Message) => {
  messagesQueue.push(newMessage);
});

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = useCallback(async () => {
    await api
      .get<Message[]>("messages/last3")
      .then((response) => setMessages(response.data))
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages((prev) =>
          [messagesQueue[0], prev[0], prev[1]].filter(Boolean)
        );

        messagesQueue.shift();
      }
    }, 3000);
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="DoWhile 20201" />

      <ul className={styles.messageList}>
        {messages.length &&
          messages.map((message) => (
            <li key={message.id} className={styles.message}>
              <p className={styles.messageContent}>{message.text}</p>
              <div className={styles.messageUser}>
                <div className={styles.userImage}>
                  <img src={message.user.avatar_url} alt={message.user.name} />
                </div>
                <span>{message.user.name}</span>
              </div>
            </li>
          ))}
      </ul>
      
    </div>
  );
}
