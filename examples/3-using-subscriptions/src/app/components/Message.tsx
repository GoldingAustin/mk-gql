import React, { FC } from 'react';

export interface MessageResponse {
  newMessages: MessageEntry;
}

export interface MessageEntry {
  id: string;
  from: string;
  message: string;
}

export const Message: FC<MessageEntry> = props => (
  <div className="notif">
    <h4>{props.from}</h4>
    <li>{props.message}</li>
  </div>
);
