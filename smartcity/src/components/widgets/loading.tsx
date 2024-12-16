import classNames from 'classnames';

interface Props {
    text?: string;
    className?: string;
    iconClassName?: string | null;
    fullscreen?: boolean;
}

/**
 * Very simple React component to show a common loader. By default it shows a spinning
 * icon and the text 'Loading...'. Both text and icon can be overridden. To prevent
 * icon from being shown at all just set the iconClassName property to empty string,
 * null, or undefined.
 */
const Loading = (props: Props): JSX.Element => {
    const {
        text = 'Loading...', className = '', iconClassName = 'fa fa-circle-o-notch fa-spin me-1', fullscreen = false
    } = props;
    const loaderClassName = classNames('loader', 'clearfix', { 'fullscreen-spinner': fullscreen }, className);
    return (
        <div title="loading" className={loaderClassName}>
            {iconClassName && <i className={classNames(iconClassName, { 'fa-3x': fullscreen })} />}
            {text}
        </div>
    );
};

export default Loading;
