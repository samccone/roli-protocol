import {MessageType} from './message_type';
import {ProtocolVersion} from './protocol_version';
import {DeviceCount} from './device_count';
import {ConnectionCount} from './connection_count';

export enum BitSizes
{
    topologyMessageHeader    = MessageType.BITS + ProtocolVersion.BITS + DeviceCount.BITS + ConnectionCount.BITS,
    topologyDeviceInfo       = sizeof (BlockSerialNumber) * 7 + BatteryLevel::bits + BatteryCharging::bits,
    topologyConnectionInfo   = topologyIndexBits + ConnectorPort::bits + topologyIndexBits + ConnectorPort::bits,

    typeDeviceAndTime        = MessageType::bits + PacketTimestampOffset::bits,

    touchMessage             = typeDeviceAndTime + TouchIndex::bits + TouchPosition::bits,
    touchMessageWithVelocity = touchMessage + TouchVelocity::bits,

    programEventMessage      = MessageType::bits + 32 * numProgramMessageInts,
    packetACK                = MessageType::bits + PacketCounter::bits,

    firmwareUpdateACK        = MessageType::bits + FirmwareUpdateACKCode::bits + FirmwareUpdateACKDetail::bits,

    controlButtonMessage     = typeDeviceAndTime + ControlButtonID::bits,

    configSetMessage         = MessageType::bits + ConfigCommand::bits + ConfigItemIndex::bits + ConfigItemValue::bits,
    configRespMessage        = MessageType::bits + ConfigCommand::bits + ConfigItemIndex::bits + (ConfigItemValue::bits * 3),
    configSyncEndMessage     = MessageType::bits + ConfigCommand::bits,
};
