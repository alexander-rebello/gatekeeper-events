import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useNotification from "./useNotification";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

export default function NotificationContainer() {
	const { notifications, removeNotification } = useNotification();

	return (
		<ToastContainer className="position-fixed mb-3 me-3" position="bottom-end">
			{notifications.map((notification) => (
				<Toast key={notification.id} show={true} delay={5000} autohide onClose={() => removeNotification(notification.id)} bg={notification.variant} className="d-flex align-items-center fs-6">
					<Toast.Body className="py-2">{notification.message}</Toast.Body>
					<button type="button" className="bg-transparent border-0 p-0 me-3 m-auto" onClick={() => removeNotification(notification.id)}>
						<FontAwesomeIcon icon={faX} />
					</button>
				</Toast>
			))}
		</ToastContainer>
	);
}
