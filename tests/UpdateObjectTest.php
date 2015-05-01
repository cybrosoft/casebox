<?php
class UpdateObjectTest extends PHPUnit_Framework_TestCase
{

    private $coreUrl = 'https://dev-u1.casebox.org/raw/';
    private $cookieFile = 'cookies.txt';

    public function testPushAndPop()
    {
        $this->getLoginKey();
        $this->login();

        $bool = $this->nodeExists(25158, false);
        $this->assertTrue($bool);

    }

    public function setDefaulCurlParams($ch) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        curl_setopt ($ch, CURLOPT_COOKIEJAR, realpath($this->cookieFile));
        curl_setopt ($ch, CURLOPT_COOKIEFILE, realpath($this->cookieFile));
    }

    public function nodeExists($id, $verbose = false)
    {
        $ch = curl_init();

        $q = '{"action":"CB_Objects","method":"getPluginsData","data":[{"id":"' . $id .
              '"}],"type":"rpc","tid":32}';

        curl_setopt($ch, CURLOPT_URL, $this->coreUrl . 'remote/router.php');
        $this->setDefaulCurlParams($ch);

        curl_setopt($ch, CURLOPT_BINARYTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $q);
        // curl_setopt($ch, CURLOPT_POSTFIELDSIZE, strlen($q));
        $t = curl_exec($ch);

        $d = json_decode($t, true);

        if ($verbose) {
            echo "Node Preview:";
            echo (print_r($d));
        }

        // var_dump($d);
        return (@$d['result']['data']['systemProperties']['data']['id'] == $id);
    }

    public function getLoginKey() {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->coreUrl . 'login/');
        $this->setDefaulCurlParams($ch);

        //return the transfer as a string
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_VERBOSE, 1);
        curl_setopt($ch, CURLOPT_HEADER, 1);

        //echo "output: $output\n";
        //echo "-- curl info --------\n";
        //var_dump(curl_getinfo($ch));
        curl_close($ch);
    }

    public function login() {

        $fields = ['u' => 'root',
                   'p' => 'casebox',
                   's' => 'Login'];

        // create curl resource
        $ch = curl_init();

        // set url
        curl_setopt($ch, CURLOPT_URL, $this->coreUrl . 'login/auth/');
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);

        curl_setopt ($ch, CURLOPT_COOKIEJAR, realpath($this->cookieFile));
        curl_setopt ($ch, CURLOPT_COOKIEFILE, realpath($this->cookieFile));

        //return the transfer as a string
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_VERBOSE, 1);
        curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
        curl_setopt($ch, CURLOPT_AUTOREFERER, true);

        // $output contains the output string
        $output = curl_exec($ch);

        //echo "output: $output\n";
        //echo "-- curl info --------\n";
        // var_dump(curl_getinfo($ch));
        // echo "----------------\n";

        // close curl resource to free up system resources
        curl_close($ch);

    }
}
?>