<?php
App::uses('Component', 'Controller');
App::import('Vendor', 'sdk', array('file' => 'php-graph-sdk' . DS . 'src' . DS . 'Facebook' . DS . 'autoload.php'));

class FacebookComponent extends Component {
    private $__connection = null;
	private $__status_accesstoken;

    public function __construct() {
		$this->__connectFacebook();
    }

    private function __connectFacebook() {
		$config = array (
			'app_id' => '456985718137023',
			'app_secret' => '317d7f0a69eff8fda59aab5ec2c9b40d',
			'default_graph_version' => 'v2.10',
		);
		$this->__connection = new Facebook\Facebook($config);

		return $this->__connection;
    }
    
    public function authFacebook() {
		$helper = $this->__connection->getRedirectLoginHelper();
		//Permission of accesstoken
		$permissions = array(
            'email'
            // 'user_link',
            // 'user_location',
            // 'user_photos',
            // 'user_age_range',
            // 'user_posts',
            // 'user_status'
		);
        $login_url = $helper->getReAuthenticationUrl(Router::url('/', true) . 'home/reAuth', $permissions);
        
		return $login_url;
	}
    
    public function callbackAuth($state_accesstoken) {
		$helper = $this->__connection->getRedirectLoginHelper();
		$helper->getPersistentDataHandler()->set('state', $state_accesstoken);
		try {
            $access_token = $helper->getAccessToken()->getValue();
            CakeSession::write('access_token', $access_token);
			return true;
		} catch (Exception $e) {
			$this->log($e->getMessage());

			return false;
		}
    }
    
    public function setDefaultAccessToken($access_token) {
		return $this->__connection->setDefaultAccessToken($access_token);
    }
    
    public function getApi($path) {
		try {
			return $this->__connection->get($path)->getDecodedBody();
		} catch (Exception $e) {
			$this->log($e->getMessage());
			return false;
		}
	}
}