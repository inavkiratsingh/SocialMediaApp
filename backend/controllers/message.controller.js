import { Conversation } from "../models/conversation.model.js"

import { Message } from "../models/message.model.js"
import { getRecieverSocketId, io } from "../socket/socket.js";

// ! For chatting
export const sendMessage = async(req, res) => {
    try {
        const senderId = req.id;
        const recieverId = req.params.id;

        const {message} = req.body;
        console.log(message);
        

        let conversation = await Conversation.findOne({
            participants: {$all: [senderId, recieverId]}
        });

        // establish the conversation if not started yet
        if(!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, recieverId]
            })
        }

        const newMessage = await Message.create({
            senderId,
            recieverId,
            message
        });

        if(newMessage) conversation.message.push(newMessage._id);

        await Promise.all([conversation.save(), newMessage.save()]);

        const receiverSocketId = getRecieverSocketId(recieverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        return res.status(200).json({
            success: true,
            newMessage
        });

    } catch (error) {
        console.log(error);
        
    }
}

export const getMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const recieverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants: {$all: [senderId, recieverId]}
        }).populate('message');
        console.log(conversation);
        

        if(!conversation) return res.status(200).json({success: true, messages:[]});

        return res.status(200).json({success: true, messages: conversation?.message});
    } catch (error) {
        console.log(error);
        
    }
}