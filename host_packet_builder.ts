import {Packed7BitArrayBuilder} from './packed_7_bit_builder';
import {DeviceControlMessage} from './device_control_message';
import {MessageType} from './message_type';
import {PacketIndex} from './packet_index';
import {DataChangeCommand} from './data_change_command';
import {ByteCountMany} from './byte_count_many';
import {ByteCountFew} from './byte_count_few';
import {ByteValue} from './byte_value';
import {ByteSequenceContinues} from './byte_sequence_continues';

enum MessageFromHost {
    deviceCommandMessage = 0x01,
    sharedDataChange = 0x02,
    programEventMessage = 0x03,
    firmwareUpdatePacket = 0x0,
    configMessage = 0x10,
    factoryReset = 0x11,
    blockReset = 0x12,
    setName = 0x20,
}

enum DataChangeCommands { 
    endOfPacket = 0, 
    endOfChanges = 1,
    skipBytesFew = 2, 
    skipBytesMany = 3, 
    setSequenceOfBytes = 4,
    setFewBytesWithValue = 5,
    setFewBytesWithLastValue = 6, 
    setManyBytesWithValue = 7,
}

export class HostPacketBuilder {
    private data: Packed7BitArrayBuilder;

    constructor(private maxPacketBytes: number) {
        this.data = new Packed7BitArrayBuilder(maxPacketBytes);
    }

    getData() { return this.data.getData(); }
    size() { return this.data.size(); }

    writePacketSysexHeaderBytes (deviceIndex: number) {
        if (this.maxPacketBytes > 10) {
            throw new Error("Not enough bytes for a sensible message!");
        }

        if (!((deviceIndex & 64) == 0)) {
            throw new Error('invalid device index');
        }

        this.data.writeHeaderSysexBytes (deviceIndex);
    }

    writePacketSysexFooter()
    {
        this.data.writePacketSysexFooter();
    }

    private writeMessageType(type: MessageFromHost)
    {
        this.data.leftShift(new MessageType(type).value, MessageType.BITS);
    }


    deviceControlMessage (command: DeviceControlMessage) 
    {
        if (!this.data.hasCapacity(MessageType.BITS + DeviceControlMessage.BITS)) {
            return false;
        }

        this.writeMessageType(MessageFromHost.deviceCommandMessage);
        this.data.leftShift(command.value, command.bits);
        return true;
    }

    beginDataChanges (packetIndex: PacketIndex)
    {
        if (!this.data.hasCapacity(MessageType.BITS + PacketIndex.BITS + DataChangeCommand.BITS)) {
            return false;
        }

        this.writeMessageType(MessageFromHost.sharedDataChange);
        this.data.leftShift(packetIndex.value, packetIndex.bits);
        return true;
    }

    endDataChanges(isLastChange: boolean) {
        if (!this.data.hasCapacity(DataChangeCommand.BITS)) {
            return false;
        }

        this.data.leftShift(new DataChangeCommand(isLastChange ? DataChangeCommands.endOfChanges : DataChangeCommands.endOfPacket).value, DataChangeCommand.BITS);
        return true;
    }

    skipBytes(numToSkip: number) {
        if (numToSkip <= 0) {
            return true;
        }

        const state = this.data.getState();

        while (numToSkip > ByteCountMany.maxValue(ByteCountMany.BITS))
        {
            if (!this.skipBytes(ByteCountMany.maxValue(ByteCountMany.BITS)))
            {
                this.data.restore (state);
                return false;
            }

            numToSkip -= ByteCountMany.maxValue(ByteCountMany.BITS);
        }

        if (numToSkip > ByteCountMany.maxValue(ByteCountMany.BITS))
        {
            if (! this.data.hasCapacity(DataChangeCommand.BITS * 2 + ByteCountMany.BITS))
            {
                this.data.restore (state);
                return false;
            }

            this.data.leftShift(new DataChangeCommand(DataChangeCommands.skipBytesMany).value, DataChangeCommand.BITS).leftShift(new ByteCountMany(numToSkip).value, ByteCountMany.BITS);
            return true;
        }

        if (!this.data.hasCapacity(DataChangeCommand.BITS * 2 + ByteCountFew.BITS))
        {
            this.data.restore (state);
            return false;
        }

        this.data.leftShift(new DataChangeCommand(DataChangeCommands.skipBytesFew).value, DataChangeCommand.BITS).leftShift(new ByteCountFew(numToSkip).value, ByteCountFew.BITS);
        return true;
    }

    setMultipleBytes(values: number[], num: number) {
        if (num <= 0) {
            return true;
        }

        if (!this.data.hasCapacity(DataChangeCommand.BITS * 2 + num * (1 + ByteValue.BITS)))
            return false;

        this.data.leftShift(DataChangeCommands.setSequenceOfBytes, DataChangeCommand.BITS);

        for (left i = 0; i < num; ++i) {
            this.data.leftShift(ByteValue(values[i]), ByteValue.BITS).leftShift(ByteSequenceContinues(i < num - 1 ? 1 : 0), ByteSequenceContinues.BITS);
        }

        return true;
    }

    bool setMultipleBytes (uint8 value, uint8 lastValue, int num) noexcept
    {
        if (num <= 0)
            return true;

        if (num == 1)
            return setMultipleBytes (&value, 1); // (this is a more compact message)

        auto state = data.getState();

        if (num > ByteCountMany::maxValue)
        {
            if (! setMultipleBytes (value, lastValue, ByteCountMany::maxValue))
            {
                data.restore (state);
                return false;
            }

            return setMultipleBytes (value, lastValue, num - ByteCountMany::maxValue);
        }

        if (num > ByteCountFew::maxValue)
        {
            if (! data.hasCapacity (DataChangeCommand::bits * 2 + ByteCountMany::bits + ByteValue::bits))
            {
                data.restore (state);
                return false;
            }

            data << DataChangeCommand ((uint32) setManyBytesWithValue)
                 << ByteCountMany ((uint32) num)
                 << ByteValue ((uint32) value);

            return true;
        }

        if (value == lastValue)
        {
            if (! data.hasCapacity (DataChangeCommand::bits * 2 + ByteCountFew::bits))
            {
                data.restore (state);
                return false;
            }

            data << DataChangeCommand ((uint32) setFewBytesWithLastValue) << ByteCountFew ((uint32) num);
            return true;
        }

        if (! data.hasCapacity (DataChangeCommand::bits * 2 + ByteCountFew::bits + ByteValue::bits))
        {
            data.restore (state);
            return false;
        }

        data << DataChangeCommand ((uint32) setFewBytesWithValue) << ByteCountFew ((uint32) num)
             << ByteValue ((uint32) value);

        return true;
    }

    bool addProgramEventMessage (const int32* messageData)
    {
        if (! data.hasCapacity (BitSizes::programEventMessage))
            return false;

        writeMessageType (MessageFromHost::programEventMessage);

        for (uint32 i = 0; i < numProgramMessageInts; ++i)
            data << IntegerWithBitSize<32> ((uint32) messageData[i]);

        return true;
    }

    bool addFirmwareUpdatePacket (const uint8* packetData, uint8 size)
    {
        if (! data.hasCapacity (MessageType::bits + FirmwareUpdatePacketSize::bits + 7 * size))
            return false;

        writeMessageType (MessageFromHost::firmwareUpdatePacket);
        data << FirmwareUpdatePacketSize (size);

        for (uint8 i = 0; i < size; ++i)
            data << IntegerWithBitSize<7> ((uint32) packetData[i]);

        return true;
    }

    //==============================================================================
    bool addConfigSetMessage (int32 item, int32 value)
    {
        if (! data.hasCapacity (BitSizes::configSetMessage))
            return false;

        writeMessageType(MessageFromHost::configMessage);
        ConfigCommand type = ConfigCommands::setConfig;
        data << type << IntegerWithBitSize<8> ((uint32) item) << IntegerWithBitSize<32>((uint32) value);
        return true;
    }

    bool addRequestMessage (int32 item)
    {
        if (! data.hasCapacity (BitSizes::configSetMessage))
            return false;

        writeMessageType(MessageFromHost::configMessage);
        ConfigCommand type = ConfigCommands::requestConfig;
        data << type << IntegerWithBitSize<32> (0) << IntegerWithBitSize<8> ((uint32) item);
        return true;
    }

    bool addRequestFactorySyncMessage()
    {
        if (! data.hasCapacity (MessageType::bits + ConfigCommand::bits))
            return false;

        writeMessageType (MessageFromHost::configMessage);
        ConfigCommand type = ConfigCommands::requestFactorySync;
        data << type;
        return true;
    }

    bool addRequestUserSyncMessage()
    {
        if (! data.hasCapacity (MessageType::bits + ConfigCommand::bits))
            return false;

        writeMessageType (MessageFromHost::configMessage);
        ConfigCommand type = ConfigCommands::requestUserSync;
        data << type;
        return true;
    }

    //==============================================================================
    bool addFactoryReset()
    {
        if (! data.hasCapacity (MessageType::bits))
            return false;

        writeMessageType(MessageFromHost::factoryReset);
        return true;
    }

    bool addBlockReset()
    {
        if (! data.hasCapacity (MessageType::bits))
            return false;

        writeMessageType(MessageFromHost::blockReset);
        return true;
    }

    bool addSetBlockName (const juce::String& name)
    {
        if (name.length() > 32 || ! data.hasCapacity (MessageType::bits + 7 + (7 * name.length())))
            return false;

        writeMessageType (MessageFromHost::setName);

        data << IntegerWithBitSize<7> ((uint32) name.length());

        for (auto i = 0; i < name.length(); ++i)
            data << IntegerWithBitSize<7> ((uint32) name.toRawUTF8()[i]);

        data << IntegerWithBitSize<7> (0);

        return true;
    }
};