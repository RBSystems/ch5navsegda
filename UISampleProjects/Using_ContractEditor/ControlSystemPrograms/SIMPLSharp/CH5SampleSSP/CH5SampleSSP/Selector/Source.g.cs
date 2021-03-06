using System;
using System.Collections.Generic;
using Crestron.SimplSharpPro;
using Crestron.SimplSharpPro.DeviceSupport;

namespace CH5SampleSSP.Selector
{
    /// <summary>
    /// request change of source
    /// </summary>
    /// <summary>
    /// Is input source routed
    /// </summary>
    /// <summary>
    /// Name of the source
    /// </summary>
    /// <summary>
    /// Class names assoicated with source
    /// </summary>
    public interface ISource
    {
        object UserObject { get; set; }

        event EventHandler<UIEventArgs> SetSourceSelected;

        void SourceIsSelected(SourceBoolInputSigDelegate callback);
        void NameOfSource(SourceStringInputSigDelegate callback);
        void IconClassOfSource(SourceStringInputSigDelegate callback);

    }

    public delegate void SourceBoolInputSigDelegate(BoolInputSig boolInputSig, ISource source);
    public delegate void SourceStringInputSigDelegate(StringInputSig stringInputSig, ISource source);

    internal class Source : ISource, IDisposable
    {
        #region Standard CH5 Component members

        private ComponentMediator ComponentMediator { get; set; }

        public object UserObject { get; set; }

        public uint ControlJoinId { get; private set; }

        private IList<BasicTriListWithSmartObject> _devices;
        public IList<BasicTriListWithSmartObject> Devices { get { return _devices; } }

        #endregion

        #region Joins

        private class Joins
        {
            internal class Booleans
            {
                public const uint SetSourceSelected = 1;

                public const uint SourceIsSelected = 1;
            }
            internal class Strings
            {

                public const uint NameOfSource = 1;
                public const uint IconClassOfSource = 2;
            }
        }

        #endregion

        #region Construction and Initialization

        internal Source(ComponentMediator componentMediator, uint controlJoinId)
        {
            ComponentMediator = componentMediator;
            Initialize(controlJoinId);
        }

        private void Initialize(uint controlJoinId)
        {
            ControlJoinId = controlJoinId; 
 
            _devices = new List<BasicTriListWithSmartObject>(); 
 
            ComponentMediator.ConfigureBooleanEvent(controlJoinId, Joins.Booleans.SetSourceSelected, onSetSourceSelected);

        }

        public void AddDevice(BasicTriListWithSmartObject device)
        {
            Devices.Add(device);
            ComponentMediator.HookSmartObjectEvents(device.SmartObjects[ControlJoinId]);
        }

        public void RemoveDevice(BasicTriListWithSmartObject device)
        {
            Devices.Remove(device);
            ComponentMediator.UnHookSmartObjectEvents(device.SmartObjects[ControlJoinId]);
        }

        #endregion

        #region CH5 Contract

        public event EventHandler<UIEventArgs> SetSourceSelected;
        private void onSetSourceSelected(SmartObjectEventArgs eventArgs)
        {
            EventHandler<UIEventArgs> handler = SetSourceSelected;
            if (handler != null)
                handler(this, UIEventArgs.CreateEventArgs(eventArgs));
        }


        public void SourceIsSelected(SourceBoolInputSigDelegate callback)
        {
            for (int index = 0; index < Devices.Count; index++)
            {
                callback(Devices[index].SmartObjects[ControlJoinId].BooleanInput[Joins.Booleans.SourceIsSelected], this);
            }
        }


        public void NameOfSource(SourceStringInputSigDelegate callback)
        {
            for (int index = 0; index < Devices.Count; index++)
            {
                callback(Devices[index].SmartObjects[ControlJoinId].StringInput[Joins.Strings.NameOfSource], this);
            }
        }

        public void IconClassOfSource(SourceStringInputSigDelegate callback)
        {
            for (int index = 0; index < Devices.Count; index++)
            {
                callback(Devices[index].SmartObjects[ControlJoinId].StringInput[Joins.Strings.IconClassOfSource], this);
            }
        }

        #endregion

        #region Overrides

        public override int GetHashCode()
        {
            return (int)ControlJoinId;
        }

        public override string ToString()
        {
            return string.Format("Contract: {0} Component: {1} HashCode: {2} {3}", "Source", GetType().Name, GetHashCode(), UserObject != null ? "UserObject: " + UserObject : null);
        }

        #endregion

        #region IDisposable

        public bool IsDisposed { get; set; }

        public void Dispose()
        {
            if (IsDisposed)
                return;

            IsDisposed = true;

            SetSourceSelected = null;
        }

        #endregion

    }
}
